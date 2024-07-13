import "dotenv/config.js";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function describeImage(imageURL){
    const res = await openai.chat.completions.create({
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

    return res;
}

export async function transformImage(imagePrompt){
    const res = await openai.images.generate({
        model: "dall-e-3",
        style: "vivid",
        prompt: imagePrompt,
    });

    return res;
}