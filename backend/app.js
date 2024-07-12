import "dotenv/config.js";
import express from "express";
import OpenAI from "openai";
import cors from "cors";
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
    }
    catch(err){
        console.log("Error in app.js", err);
    }
})