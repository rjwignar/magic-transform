import {
	Button,
	Rows,
	Text,
	Title,
	ImageCard,
	Switch,
	Grid,
	Box,
} from "@canva/app-ui-kit";
import type { ExportResponse } from "@canva/design";
import { requestExport } from "@canva/design";
import { useState } from "react";
import styles from "styles/components.css";
import { upload } from "@canva/asset";
import { addNativeElement, ui } from "@canva/design";
import TransformProgressBar from "../components/TransformProgressBar";
import cartoon from "assets/images/cartoonTransformation.png";
import oilpaint from "assets/images/oilPaintingTransformation.png";
import realistic from "assets/images/photorealisticTransformation.png";
import pencil from "assets/images/pencilSketchTransformation.png";
import anime from "assets/images/ninetiesAnimeTransformation.png";
import nostyle from "assets/images/nostyle.png";
import square from "assets/images/square.png";
import landscape from "assets/images/landscape.png";
import portrait from "assets/images/portrait.png";
import papercut from "assets/images/papercutTransformation.png";
import psychedelic from "assets/images/psychedelicTransformation.png";
import stainedGlass from "assets/images/stainedGlassTransformation.png";
import retrowave from "assets/images/synthwaveTransformation.png";
import threeD from "assets/images/threeDimensionalTransformation.png";
import woodblock from "assets/images/woodBlockPrintTransformation.png";

const backendHost = BACKEND_HOST || "http://localhost:4242";
export const App = () => {
	const [state, setState] = useState<"exporting" | "idle">("idle");
	const [exportResponse, setExportResponse] = useState<
		ExportResponse | undefined
	>();
	const [receivedImage, setReceivedImage] = useState("");
	// Use this state to notify TransformProgressBar when image transformation job is complete
	const [transformJobComplete, setTransformJobComplete] = useState(false);
	// Use this state as a prompt to send to the AI to control the style of the generated image.
	const [enabledSwitch, setEnabledSwitch] = useState("");
	// State for tracking selected aspect ratio
	const [imageAspectRatio, setImageAspectRatio] = useState("square");
	// State for hiding and showing creation menu and options
	const [showMenu, setShowMenu] = useState(true);
	var width, height;
	if (imageAspectRatio === "square") {
		width = 1024;
		height = 1024;
	} else if (imageAspectRatio === "landscape") {
		width = 1792;
		height = 1024;
	} else if (imageAspectRatio === "portrait") {
		width = 1024;
		height = 1792;
	}
	const [showMoreStyles, setShowMoreStyles] = useState(false);

	// Used for ensuring progress bar fills completely before disappearing
	let timeoutId: undefined | ReturnType<typeof setTimeout>;
	// Uploads image to Canva's 'Uploads' library for the user's future use
	const uploadExternalImage = () => {
		return upload({
			mimeType: "image/png",
			thumbnailUrl: receivedImage,
			type: "IMAGE",
			url: receivedImage,
			width: width,
			height: height,
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
				width: width,
				height: height,
			},
			fullSize: {
				width: width,
				height: height,
			},
		});
	};

	// This just handles exporting the image and grabbing the URL of the public image
	const exportDocument = async () => {
		if (state === "exporting") return;
		try {
			setState("exporting");
			setShowMenu(false);
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
			if (response.status === "ABORTED") {
				setExportResponse(undefined);
				setShowMenu(true);
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
		// Reset received image
		clearTimeout(timeoutId);
		setReceivedImage("");
		// setTransformJobComplete(false);

		// Pretend this posted the url to
		console.log("postImageURL called with image URL: " + url);
		// call /api/describe
		let res = await fetch(`${backendHost}/api/describe`, {
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
		res = await fetch(`${backendHost}/api/transform`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				imageDescription: imageDescription,
				imageStyle: imageStyle,
				imageAspectRatio: imageAspectRatio,
			}),
		});
		response = await res.json();
		setTransformJobComplete(true);
		console.log(response);

		// Pretend this awaited and received something from the AI
		const base64JsonString = response.data[0].b64_json;
		console.log(base64JsonString);
		let transformedImage = new Image();
		transformedImage.src = base64JsonString
			? `data:image/png;base64,${base64JsonString}`
			: response.data[0].url;

		timeoutId = setTimeout(() => {
			setReceivedImage(transformedImage.src);
			console.log("Delaying image url assignment");
		}, 1000);
		// setReceivedImage(response.data[0].url);
		const image = await upload({
			type: "IMAGE",
			mimeType: "image/png",
			url: transformedImage.src,
			thumbnailUrl: transformedImage.src,
			width: width,
			height: height,
		});
	};

	return (
		<div className={styles.scrollContainer}>
			{showMenu && (
				<Rows spacing="1u">
					<Title size="large">Magic Transform</Title>
					<Text>
						Turn your imagination into beautiful artwork. Drag Canva elements
						onto the page that capture your idea, and let us handle the rest.
					</Text>
					<Title size="medium">Transformation Styles</Title>

					<Grid alignX="center" alignY="center" columns={3} spacing="1u">
						<ImageCard
							ariaLabel="No style image"
							borderRadius="standard"
							onClick={() => setEnabledSwitch("")}
							selectable={true}
							selected={enabledSwitch === ""}
							thumbnailUrl={nostyle}
						/>
						<ImageCard
							ariaLabel="Cartoon-y image"
							borderRadius="standard"
							onClick={() => setEnabledSwitch("cartoon")}
							selectable={true}
							selected={enabledSwitch === "cartoon"}
							thumbnailUrl={cartoon}
						/>
						<ImageCard
							ariaLabel="Oil painting image"
							borderRadius="standard"
							onClick={() => setEnabledSwitch("oil-painting")}
							selectable={true}
							selected={enabledSwitch === "oil-painting"}
							thumbnailHeight={96}
							thumbnailUrl={oilpaint}
						/>
						<Title size="xsmall">No Style</Title>
						<Title size="xsmall">Cartoon-y</Title>
						<Title size="xsmall">Oil Painting</Title>
						<ImageCard
							ariaLabel="Oil painting image"
							borderRadius="standard"
							onClick={() => setEnabledSwitch("photo realistic")}
							selectable={true}
							selected={enabledSwitch === "photo realistic"}
							thumbnailHeight={96}
							thumbnailUrl={realistic}
						/>
						<ImageCard
							ariaLabel="Pencil sketch image"
							borderRadius="standard"
							onClick={() => setEnabledSwitch("simple-pencil-sketch")}
							selectable={true}
							selected={enabledSwitch === "simple-pencil-sketch"}
							thumbnailHeight={96}
							thumbnailUrl={pencil}
						/>
						<ImageCard
							ariaLabel="Anime image"
							borderRadius="standard"
							onClick={() => setEnabledSwitch("anime")}
							selectable={true}
							selected={enabledSwitch === "anime"}
							thumbnailHeight={96}
							thumbnailUrl={anime}
						/>
						<Title size="xsmall">Realistic</Title>
						<Title size="xsmall">Pencil Sketch</Title>
						<Title size="xsmall">Anime</Title>

						<ImageCard
							ariaLabel="Retrowave image"
							borderRadius="standard"
							onClick={() => setEnabledSwitch("retrowave")}
							selectable={true}
							selected={enabledSwitch === "retrowave"}
							thumbnailHeight={96}
							thumbnailUrl={retrowave}
						/>
						<ImageCard
							ariaLabel="Papercut image"
							borderRadius="standard"
							onClick={() => setEnabledSwitch("papercut")}
							selectable={true}
							selected={enabledSwitch === "papercut"}
							thumbnailHeight={96}
							thumbnailUrl={papercut}
						/>
						<ImageCard
							ariaLabel="Woodblock print image"
							borderRadius="standard"
							onClick={() => setEnabledSwitch("wood-block print")}
							selectable={true}
							selected={enabledSwitch === "wood-block print"}
							thumbnailHeight={96}
							thumbnailUrl={woodblock}
						/>
						<Title size="xsmall">Retrowave</Title>
						<Title size="xsmall">Papercut</Title>
						<Title size="xsmall">Wood-Block</Title>

						<ImageCard
							ariaLabel="Stained glass image"
							borderRadius="standard"
							onClick={() => setEnabledSwitch("stained glass")}
							selectable={true}
							selected={enabledSwitch === "stained glass"}
							thumbnailHeight={96}
							thumbnailUrl={stainedGlass}
						/>
						<ImageCard
							ariaLabel="Psychedelic image"
							borderRadius="standard"
							onClick={() => setEnabledSwitch("psychedelic")}
							selectable={true}
							selected={enabledSwitch === "psychedelic"}
							thumbnailHeight={96}
							thumbnailUrl={psychedelic}
						/>
						<ImageCard
							ariaLabel="3D image"
							borderRadius="standard"
							onClick={() => setEnabledSwitch("three dimensional")}
							selectable={true}
							selected={enabledSwitch === "three dimensional"}
							thumbnailHeight={96}
							thumbnailUrl={threeD}
						/>
						<Title size="xsmall">Stained Glass</Title>
						<Title size="xsmall">Psychedelic</Title>
						<Title size="xsmall">3D</Title>
					</Grid>

					<Title size="medium">Aspect Ratio</Title>
					<Grid alignX="center" alignY="center" columns={3} spacing="1u">
						<ImageCard
							ariaLabel="Square ratio"
							borderRadius="standard"
							onClick={() => setImageAspectRatio("square")}
							selectable={true}
							selected={imageAspectRatio === "square"}
							thumbnailUrl={square}
						/>
						<ImageCard
							ariaLabel="Landscape ratio"
							borderRadius="standard"
							onClick={() => setImageAspectRatio("landscape")}
							selectable={true}
							selected={imageAspectRatio === "landscape"}
							thumbnailUrl={landscape}
						/>
						<ImageCard
							ariaLabel="Portrait ratio"
							borderRadius="standard"
							onClick={() => setImageAspectRatio("portrait")}
							selectable={true}
							selected={imageAspectRatio === "portrait"}
							thumbnailHeight={96}
							thumbnailUrl={portrait}
						/>

						<Title size="xsmall">Square</Title>
						<Title size="xsmall">Landscape</Title>
						<Title size="xsmall">Portrait</Title>
					</Grid>

					<Button
						variant="primary"
						onClick={exportDocument}
						loading={state === "exporting"}
					>
						Transform
					</Button>
				</Rows>
			)}

			{exportResponse && receivedImage === "" ? (
				<div>
					<Title>Transforming your image.</Title>
					<TransformProgressBar
						duration={30}
						transformJobComplete={transformJobComplete}
					></TransformProgressBar>
					<Text size="large">
						Please wait. More complex images may take longer.
					</Text>
				</div>
			) : null}

			{receivedImage !== "" && transformJobComplete === true && (
				<Rows spacing="1u">
					<Title size="small">External Image</Title>

					<ImageCard
						ariaLabel="Add image to design"
						alt="grass image"
						thumbnailUrl={receivedImage}
						onClick={insertExternalImage}
						onDragStart={onDragStartForExternalImage}
					/>
					{/* <Text>{receivedImage}</Text> */}
					{!showMenu && (
						<Button
							variant="primary"
							onClick={() => {
								setShowMenu(true);
								setTransformJobComplete(false);
							}}
						>
							Return
						</Button>
					)}
				</Rows>
			)}
		</div>
	);
};
