import "dotenv/config.js";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const describePrompt = `Return a description of this image that can be used to accurately recreate the image. 
                        Do not include references to any style the image might have.
                        Start your description with 'The image depicts'`;
export async function describeImage(imageURL) {
    const res = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 200,
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: describePrompt },
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

export async function transformImage(imagePrompt, imageSize) {
    const res = await openai.images.generate({
        model: "dall-e-3",
        style: "vivid",
        size: imageSize,
        prompt: imagePrompt,
        response_format: "b64_json",
    });

    return res;
}