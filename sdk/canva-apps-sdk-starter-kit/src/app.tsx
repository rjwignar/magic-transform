import { Button, Rows, Text, Title, ImageCard } from "@canva/app-ui-kit";
import type { ExportResponse } from "@canva/design";
import { requestExport } from "@canva/design";
import { useState } from "react";
import styles from "styles/components.css";
import { upload } from "@canva/asset";
import { addNativeElement, ui } from "@canva/design";

export const App = () => {
	const [state, setState] = useState<"exporting" | "idle">("idle");
	const [exportResponse, setExportResponse] = useState<
		ExportResponse | undefined
	>();
	const [receivedImage, setReceivedImage] = useState("");

	const uploadExternalImage = () => {
		return upload({
			mimeType: "image/jpeg",
			thumbnailUrl: receivedImage,
			type: "IMAGE",
			url: receivedImage,
			width: 320,
			height: 212,
		});
	};

	const insertExternalImage = async () => {
		const { ref } = await uploadExternalImage();
		await addNativeElement({ type: "IMAGE", ref });
	};

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
			headers : {
				"Content-Type" : "application/json"
			},
			body: JSON.stringify({
				imageURL: url,
			})
		});
		let response = await res.json();
		console.log(response);

		// Save image description
		const imageDescription = response.choices[0].message.content;
		console.log("description", imageDescription);
	
		// Pretend this awaited and received something from the AI
		setReceivedImage(
			"https://oaidalleapiprodscus.blob.core.windows.net/private/org-MEVmK2uiLdmnkIX28J7umA5X/user-HDtlaQcpH4UVwTWQPRji59XQ/img-gLbPv89WuQwu6DquNg7WKVdI.png?st=2024-07-12T18%3A59%3A13Z&se=2024-07-12T20%3A59%3A13Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-07-12T19%3A49%3A38Z&ske=2024-07-13T19%3A49%3A38Z&sks=b&skv=2023-11-03&sig=1Nl70EfHs%2BHYHrZ9v6l%2B1g1fzcx6Nb7Thd59NCWEVRo%3D"
		);
		const image = await upload({
			type: "IMAGE",
			mimeType: "image/jpeg",
			url: "https://oaidalleapiprodscus.blob.core.windows.net/private/org-MEVmK2uiLdmnkIX28J7umA5X/user-HDtlaQcpH4UVwTWQPRji59XQ/img-gLbPv89WuQwu6DquNg7WKVdI.png?st=2024-07-12T18%3A59%3A13Z&se=2024-07-12T20%3A59%3A13Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-07-12T19%3A49%3A38Z&ske=2024-07-13T19%3A49%3A38Z&sks=b&skv=2023-11-03&sig=1Nl70EfHs%2BHYHrZ9v6l%2B1g1fzcx6Nb7Thd59NCWEVRo%3D",
			thumbnailUrl:
				"https://oaidalleapiprodscus.blob.core.windows.net/private/org-MEVmK2uiLdmnkIX28J7umA5X/user-HDtlaQcpH4UVwTWQPRji59XQ/img-gLbPv89WuQwu6DquNg7WKVdI.png?st=2024-07-12T18%3A59%3A13Z&se=2024-07-12T20%3A59%3A13Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-07-12T19%3A49%3A38Z&ske=2024-07-13T19%3A49%3A38Z&sks=b&skv=2023-11-03&sig=1Nl70EfHs%2BHYHrZ9v6l%2B1g1fzcx6Nb7Thd59NCWEVRo%3D",
			width: 540,
			height: 720,
		});
	};

	// This should handle fetching the AI generated image from the backend AI API
	const fetchGeneratedImage = async () => {};

	return (
		<div className={styles.scrollContainer}>
			<Rows spacing="1u">
				<Title size="small">Export</Title>
				<Text>This example demonstrates how apps can export designs.</Text>
				<Button
					variant="primary"
					onClick={exportDocument}
					loading={state === "exporting"}
				>
					Export
				</Button>
			</Rows>

			<br></br>
			<br></br>
			<br></br>

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
