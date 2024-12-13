import express, { response } from 'express';
import axios from "axios";
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import {encode} from 'gpt-tokenizer';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const app=express();

app.use(bodyParser.json())
app.use(cors())

const port = 3080;

app.post('/', async(req,res) => {
    const { message, currentModel } = req.body; //all messages and the selected AI model from frontend
    //console.log("Entered Message:", message);
    console.log("Current Model:", currentModel.name);
    console.log("Input Tokens:", encode(message).length) //to calculate Input Tokens (not necessarily required)
    console.log("Max Tokens:", currentModel.top_provider.max_completion_tokens);   //max_tokens will control the limited of generated message. eg. max_tokens: 8192, the output token will not exceed 8192 token length 
    console.log("Max_Context_Length:", currentModel.top_provider.context_length ) //Context length is like a "workspace" where input+output must be within the max context length
    
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: `${currentModel.id}`, //'openai/gpt-3.5-turbo', 
          messages: [
            {
              role: 'user',
              content: `${message}`,
            }
          ],
          max_tokens: currentModel.top_provider.max_completion_tokens, //set the max_tokens provided by model object data
        }, {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          }
        });
        console.log('\n API Response:', response.data);  //Reponse data from API
        const messageContent = response.data.choices[0].message.content;
        //console.log(messageContent);
        
        //response the generated result to Frontend      
        res.json({ 
        message: messageContent,
        })
    
      } catch (error) {
        console.error('Error:', error);
        throw error;  
      }
})

//get usable models from openrouter
app.get('/models', async (req, res) => {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models');
    
    // Log the entire response to check its structure
    //console.log('Full response:', response.data);
    
    // Check if response.data exists and contains the models array
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // Filter models where pricing.prompt is "0"
      const freeModels = response.data.data.filter(model => model.pricing && model.pricing.prompt === "0");

      // Return the filtered models
      res.json({ models: freeModels });
      
    } else {
      
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});



app.listen(port, () =>{
    console.log('SERVER STARTED AT: PORT',port);
})