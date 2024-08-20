import express from "express";
import cors from "cors";
import { argv } from 'node:process';
import { describeImage, transformImage } from "./openai/agent.js";
import { readFileSync } from "node:fs";
import logger from "./logger.js";
const app = express();
app.use(express.json());
// CORS configuration
const corsOptions: cors.CorsOptions = {
    origin: process.env.CANVA_APP_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'] // I'm unsure about changing headers to allowedHeaders
}
app.use(cors(corsOptions));
// Health probe endpoint
app.get('/', (req, res) => {
    res.send({ "status": "ready" });
});

function handleJSONParseError(error) {
    // Print original error to console
    logger.error(`Encountered '${error.errno}': ${error}`);
    // Assign status of 500 and obfuscate original error so it's not exposed to frontend
    error.message = `Internal Server Error`;
    error.status = 500;
    throw error;
}
// Takes image URL and describes 
// POST /api/describe
app.post('/api/describe', async (req, res) => {
    try {
        // const imageURL = `https://www.shutterstock.com/shutterstock/photos/2292916287/display_1500/stock-photo-two-business-people-a-business-man-and-a-business-woman-engage-in-a-discussion-as-they-read-a-2292916287.jpg`;
        const imageURL = req.body.imageURL;
        let response;
        if (process.env.NODE_ENV === 'test') {
            // Return sample response
            try {
                response = JSON.parse(readFileSync('samples/describeSample.json', 'utf-8'));
            } catch (error) {
                handleJSONParseError(error);
            }
        }
        else if (process.env.NODE_ENV === 'production') {
            // Pass imageURL to OpenAI Omni (GPT-4o)
            response = await describeImage(imageURL);
        }
        logger.debug(response);
        res.json(response);
    }
    catch (error: any) {
        res.status(error.status).send({ message: error.message });
    }
})

// POST /api/transform
// Takes image description and creates a new image out of it.
app.post('/api/transform', async (req, res) => {
    const description = req.body.imageDescription;
    const style = req.body.imageStyle;
    const aspectRatio = req.body.imageAspectRatio;
    const aspectRatioSizes = new Map([
        ['square', '1024x1024'],
        ['landscape', '1792x1024'],
        ['portrait', '1024x1792']
    ]);
    const imageSize = aspectRatioSizes.get(aspectRatio);
    let imagePrompt = style ? `A(n) ${style} illustration that matches the following description:\n${description}` : description;
    logger.debug("Image prompt: %s", imagePrompt);
    try {
        let transformedImage;
        if (process.env.NODE_ENV === 'test') {
            // Return sample response
            try {
                transformedImage = JSON.parse(readFileSync('samples/transformSample.json'));
            } catch (error) {
                handleJSONParseError(error);
            }
        }
        else if (process.env.NODE_ENV === 'production') {
            // Pass imagePrompt to OpenAI DALL-E-3
            transformedImage = await transformImage(imagePrompt, imageSize);
        }
        logger.debug("New image response: %j", transformedImage);

        // return image URL
        res.json(transformedImage);
    } catch (error) {
        res.status(error.status).send({ message: error.message });
    }
});

// parse out hosting port from cmd arguments if passed in
// otherwise default to port 4242
var port = (() => {
    var port = 4242; // default
    if (argv) {
        argv.forEach((v, i) => {
            if (v && (v.toLowerCase().startsWith('port='))) {
                port = v.substring(5);
            }
        });
    }
    return port;
})();

app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
});