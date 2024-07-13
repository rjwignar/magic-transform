import express from "express";
import cors from "cors";
import { argv } from 'node:process';
import { describeImage, transformImage } from "./openai/agent.js";
const app = express();
app.use(express.json());
app.use(cors());

// Takes image URL and describes 
// POST /api/describe
app.post('/api/describe', async (req, res) => {
    try {
        // const imageURL = `https://www.shutterstock.com/shutterstock/photos/2292916287/display_1500/stock-photo-two-business-people-a-business-man-and-a-business-woman-engage-in-a-discussion-as-they-read-a-2292916287.jpg`;
        const imageURL = req.body.imageURL;

        // Pass imageURL to OpenAI Omni (GPT-4o)
        const response = await describeImage(imageURL);

        // console.log(response);
        res.json(response);
    }
    catch(err){
        console.log("Error in app.js", err);
    }
})

// POST /api/transform
// Takes image description and creates a new image out of it.
app.post('/api/transform', async (req, res) =>{
    const description = req.body.imageDescription;
    const style = req.body.imageStyle;
    const imagePrompt = `Create an image that matches the following description:
    ${description}. The image is created in a(n) ${style} style.`;
    // console.log("Original prompt", imagePrompt);

    // Pass imagePrompt to OpenAI DALL-E-3
    const transformedImage = await transformImage(imagePrompt);
    // console.log("New image response: ", transformedImage);

    // return image URL
    res.json(transformedImage);
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
    console.log(`Server started on port ${port}`);
});