import "dotenv/config.js";
import express from "express";
import OpenAI from "openai";
import cors from "cors";
import { argv } from 'node:process';
const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Takes image URL and describes 
// POST /api/describe
app.post('/api/describe', async (req, res) => {
    try {

        // const imageURL = req.body.imageURL;
        const imageURL = `https://www.shutterstock.com/shutterstock/photos/2292916287/display_1500/stock-photo-two-business-people-a-business-man-and-a-business-woman-engage-in-a-discussion-as-they-read-a-2292916287.jpg`;
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Can you describe what's in this image?" },
                        {
                            type: "image_url",
                            image_url: {
                                "url": imageURL
                            },
                        },
                    ],
                },
            ],
        });

        console.log(response);
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
    const imagePrompt = `Create an image in ${style} style that matches the following description:
    ${description}`;

    const transformedImage = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
    });

    console.log("New image response: ", transformedImage);
    const transformedImageURL = image.data[0].url;

    // return image URL
    return transformedImageURL
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