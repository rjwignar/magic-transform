import {
	Button,
	Rows,
	Text,
	Title,
	ImageCard,
	Switch,
} from "@canva/app-ui-kit";
import type { ExportResponse } from "@canva/design";
import { requestExport } from "@canva/design";
import { useEffect, useState } from "react";
import styles from "styles/components.css";
import { upload } from "@canva/asset";
import { addNativeElement, ui } from "@canva/design";

export const App = () => {
	const [state, setState] = useState<"exporting" | "idle">("idle");
	const [exportResponse, setExportResponse] = useState<
		ExportResponse | undefined
	>();
	const [receivedImage, setReceivedImage] = useState("");

	// Use this state as a prompt to send to the AI to control the style of the generated image.
	const [enabledSwitch, setEnabledSwitch] = useState("cartoonSwitch");

	// Uploads image to Canva's 'Uploads' library for the user's future use
	const uploadExternalImage = () => {
		return upload({
			mimeType: "image/png",
			thumbnailUrl: receivedImage,
			type: "IMAGE",
			url: receivedImage,
			width: 320,
			height: 212,
		});
	};

	// Adds selected image to Canva's current page as an element
	const insertExternalImage = async () => {
		const { ref } = await uploadExternalImage();
		await addNativeElement({ type: "IMAGE", ref });
	};

	// Adds functionality to upload dragged image to Canva's 'Uploads' library
	const onDragStartForExternalImage = (event: React.DragEvent<HTMLElement>) => {
		ui.startDrag(event, {
			type: "IMAGE",
			resolveImageRef: uploadExternalImage,
			previewUrl: receivedImage,
			previewSize: {
				width: 320,
				height: 212,
			},
			fullSize: {
				width: 320,
				height: 212,
			},
		});
	};

	// This just handles exporting the image and grabbing the URL of the public image
	const exportDocument = async () => {
		if (state === "exporting") return;
		try {
			setState("exporting");
			const response = await requestExport({
				acceptedFileTypes: ["PNG"],
			});

			// TODO: Send the URL to your backend using fetch
			setExportResponse(response);

			// Shows the public URL of the exported canva design image
			// TODO: Send this to backend, handle fetch later
			if (response.status === "COMPLETED") {
				postImageURL(response.exportBlobs[0].url);
			}
		} catch (error) {
			// TODO: Add error handling
			console.log(error);
		} finally {
			setState("idle");
		}
	};

	// This should handle sending the exported image URL to the backend AI API
	const postImageURL = async (url: string) => {
		// Pretend this posted the url to
		console.log("postImageURL called with image URL: " + url);
		// call /api/describe
		let res = await fetch("http://localhost:4242/api/describe", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				imageURL: url,
			}),
		});
		let response = await res.json();
		console.log(response);

		// Save image description
		const imageDescription = response.choices[0].message.content;
		console.log("description", imageDescription);
		const imageStyle = enabledSwitch;
		// Pass description and art style to POST /api/transform
		res = await fetch("http://localhost:4242/api/transform", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				imageDescription: imageDescription,
				imageStyle: imageStyle,
			}),
		});
		response = await res.json();
		console.log(response);

		// Pretend this awaited and received something from the AI
		const base64JsonString = response.data[0].b64_json;
		console.log(base64JsonString);
		let transformedImage = new Image();
		transformedImage.src = `data:image/png;base64,${base64JsonString}`;

		setReceivedImage(transformedImage.src);
		// setReceivedImage(response.data[0].url);
		const image = await upload({
			type: "IMAGE",
			mimeType: "image/png",
			url: transformedImage.src,
			thumbnailUrl: transformedImage.src,
			width: 540,
			height: 720,
		});
	};

	return (
		<div className={styles.scrollContainer}>
			<Rows spacing="1u">
				<Title size="large">Canvas-To-AI</Title>
				<Text>
					Turn your imagination into beautiful artwork. Drag Canva elements onto
					the page that capture your idea, and let us handle the rest.
				</Text>
				<Title size="medium">Transformation Styles</Title>
				<Switch
					value={enabledSwitch === "cartoon"}
					label="Cartoon-y"
					description="A style the kids will love. Perfect for kids books!"
					onChange={() => setEnabledSwitch("cartoon")}
				/>
				<Switch
					value={enabledSwitch === "oil-painting"}
					label="Oil Painting"
					description="Fancy~! Might want to hang this on the wall after."
					onChange={() => setEnabledSwitch("oil-painting")}
				/>
				<Switch
					value={enabledSwitch === "simple-pencil-sketch"}
					label="Pencil Sketch"
					description="Want to practice drawing? Get an idea by tracing the image out."
					onChange={() => setEnabledSwitch("simple-pencil-sketch")}
				/>
				<br></br>
				<Button
					variant="primary"
					onClick={exportDocument}
					loading={state === "exporting"}
				>
					Transform
				</Button>
			</Rows>

			{receivedImage !== "" && (
				<Rows spacing="1u">
					<Title size="small">External Image</Title>
					<Text>
						This example demonstrates how apps can support drag-and-drop of
						images.
					</Text>
					<Text size="small" tone="tertiary">
						This image is an external https image made draggable via drag and
						drop and asset upload.
					</Text>
					<ImageCard
						ariaLabel="Add image to design"
						alt="grass image"
						thumbnailUrl={receivedImage}
						onClick={insertExternalImage}
						onDragStart={onDragStartForExternalImage}
					/>
					<Text>{receivedImage}</Text>
				</Rows>
			)}
		</div>
	);
};
