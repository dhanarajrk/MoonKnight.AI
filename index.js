import express, { response } from 'express';
import axios from "axios";
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import {encode} from 'gpt-tokenizer';
import ImageKit from 'imagekit';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const app=express();

app.use(bodyParser.json())
app.use(cors({
  origin: process.env.CLIENT_URL
}))

const port = 3080;

//ImageKitio
const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});


app.post('/', async(req,res) => {
    const { message, imgUrl, currentModel } = req.body; //all messages and the selected AI model from frontend
    console.log("Entered Message:", message);
    console.log("Image URL:", imgUrl);
    console.log("Current Model:", currentModel.name);
    //console.log("Input Tokens:", encode(message).length) //to calculate Input Tokens (not necessarily required)
    //console.log("Max Tokens:", currentModel.top_provider.max_completion_tokens);   //max_tokens will control the limited of generated message. eg. max_tokens: 8192, the output token will not exceed 8192 token length 
    //console.log("Max_Context_Length:", currentModel.top_provider.context_length ) //Context length is like a "workspace" where input+output must be within the max context length
    
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: `${currentModel.id}`, //'openai/gpt-3.5-turbo', 
          messages: [
            {
              role: 'user',
              content: [
                { "type": "text", "text": `${message}` },  // Add text message
                ...(imgUrl ? [{ "type": "image_url", "image_url": { "url": `${imgUrl}` } }] : []) // and Add image URL if available
              ]
            }
          ],
          max_tokens: currentModel.top_provider.max_completion_tokens, //set the max_tokens provided by model object data
        }, {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          }
        });
        
        console.log('\n API Response:', response.data);  //Reponse data from API
        
        //if api server reponse an error. then stop the program 
        if(response.data.error){
          const errorMessage = JSON.parse(response.data.error.metadata.raw);
          throw new Error(errorMessage.error.message)
        }

        const messageContent = response.data.choices[0].message.content;
        //console.log(messageContent);
        
        //response the generated result to Frontend if no error  
        res.json({ 
        message: messageContent,
        })
    
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
          error: error.message,
        });
      }
})


//endpoint to get usable models from openrouter
app.get('/models', async (req, res) => {
  
  const manualChoosenModel = [  //I manually Choosen these models to include in the list along with other free models. These choosen models are working like free even though its not . I don't know if it is temporary!
    'google/gemini-flash-1.5',
    'google/gemini-flash-1.5-8b',
    'openai/gpt-4o-mini',
    'microsoft/wizardlm-2-8x22b',
  ];

  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models');
      
    // Log the entire response to check its structure
    //console.log('Full response:', response.data);
    
    //filtering to get free models and also choosen models
    const freeModels = response.data.data.filter(
      model => (model.pricing && model.pricing.prompt === "0") || manualChoosenModel.includes(model.id)
    );
   
    // Return the filtered models
    res.json({ models: freeModels }); 

   } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
   }

});

//endpoint for upload image
app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
})


app.listen(port, () =>{
    console.log('SERVER STARTED AT: PORT',port);
})