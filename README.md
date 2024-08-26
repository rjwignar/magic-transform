# Magic Transform - AI-Enabled Canva App for Image Generation
![magicTransformDemo](https://github.com/user-attachments/assets/4b8285d1-5b4b-457a-9c25-c2cf061ff4b3)

## Inspiration

Image generators like DALL-E are impressive, but many people struggle with 
engineering effective image prompts. We wanted to create an app that allows 
users to easily assemble their own images, even in disparate styles. With our 
app, users can add elements to a canvas, and AI will generate a prompt from the 
image to recreate it in a consistent style. This approach shifts from 
text-to-image generation to a more intuitive image-to-image generation, making 
image generation with AI more accessible.

## What It Does

Magic Transform allows users to create images by assembling elements on 
a canvas. The app then uses AI to generate a prompt from the assembled image 
and recreates it in a consistent style using DALL-E 3.

### Key Features

- **Image-to-Image Generation**: Users can add elements to a canvas, and AI 
  will generate a prompt to recreate the image in a consistent style.
- **Seamless Integration**: Built using the Canva SDK, OpenAI API, and 
  Microsoft Azure, the app provides a smooth user experience.
- **Export and Transform**: The app exports the current canvas and passes it 
  to OpenAI's GPT Omni model to retrieve a description, which is then used to 
  generate a new image with DALL-E 3.

### Technologies Used

- **Backend**: Node.js, OpenAI API, Docker, Microsoft Azure Container Apps
- **Frontend**: React, TypeScript, Canva SDK, Cloudinary
- **Deployment**: Docker containerization, Azure Container Apps, Cloudinary 
  for asset hosting

## What's Next

- **Codebase Improvements**: We plan to enhance the readability and 
  optimization of the codebase.
- **UI/UX Enhancements**: We aim to add new UI elements to improve the user 
  interface and user experience.
- **New Features**: We are exploring the possibility of adding features that 
  allow users to easily share their creations and implementing a payment model 
  to accept payments.
