import "dotenv/config.js";
import { OpenAI, AzureOpenAI } from "openai";
import logger from "../logger.js"
import { ImageGenerateParams } from "openai/resources/images.js";
import { ChatCompletionContentPartImage } from "openai/resources/index.js";
// setup OpenAI client (OpenAI or Azure OpenAI)
// apiVersion required for AzureOpenAI, refer to 
// For AzureOpenAI, deployment is not a requirement, but you must use the appropriate deployment name as the 'model' property in the endpoint calls
const apiVersion = "2024-05-01-preview";
const client = (process.env.AOAI_KEY) ? new AzureOpenAI({ apiKey: process.env.AOAI_KEY, apiVersion: apiVersion, endpoint: process.env.AOAI_ENDPOINT }) : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function handleOpenAIError(error: Error | any) {
    error.message = `OpenAI API Error: ${error.message}`
    logger.error(error.message);
    throw error;
}
function whatClient() {
    (client instanceof AzureOpenAI) ?
        logger.info('Azure Deployment called') :
        logger.info("OpenAI API called");
}
// Deployment (model) names on Azure OpenAI Service (as of openai Version 4.52.7)
const describingDeploymentName = "omni";
const imageGenerationDeploymentName = "imageGeneration";

// Model names on OpenAI API (as of openai Version 4.52.7)
const describeModelName = "gpt-4o";
const imageModelName = "dall-e-3";

const textModel = (client instanceof AzureOpenAI) ? describingDeploymentName : describeModelName;
const imageModel = (client instanceof AzureOpenAI) ? imageGenerationDeploymentName : imageModelName;

const describePrompt = `Return a description of this image that can be used to accurately recreate the image. 
                        Do not include references to any style the image might have.
                        Start your description with 'The image depicts'`;

// ChatCompletionContentPartImage.ImageURL['url'] is `string` type
export async function describeImage(imageURL: ChatCompletionContentPartImage.ImageURL['url']) {
    whatClient();
    try {
        const res = await client.chat.completions.create({
            model: textModel,
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

    } catch (error) {
        handleOpenAIError(error);
    }
}

// ImageGenerateParams['prompt'] is `string` type
// ImageGenerateParams['size'] is a model-dependent Union type
export async function transformImage(imagePrompt: ImageGenerateParams['prompt'], imageSize: ImageGenerateParams['size']) {
    whatClient();
    try {
        const res = await client.images.generate({
            model: imageModel,
            style: "vivid",
            size: imageSize,
            prompt: imagePrompt,
            response_format: "b64_json",
        });
        return res;

    } catch (error) {
        handleOpenAIError(error);
    }
}