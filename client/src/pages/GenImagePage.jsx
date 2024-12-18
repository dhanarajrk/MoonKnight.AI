import React, { useState, useEffect } from "react";
import "./genimagepage.css"; // Importing the specific CSS for this page
import {Link} from "react-router-dom";

function GenImagePage() {
  
  const imageModels = [
    { "name": "flux" },
    { "name": "flux-realism" },
    { "name": "flux-cablyai" },
    { "name": "flux-anime" },
    { "name": "flux-3d" },
    { "name": "any-dark" },
    { "name": "flux-pro" },
    { "name": "turbo" }
  ];

  const [currentImageModel, setCurrentImageModel] = useState(imageModels[0].name); //as default set it to first model name when page loads


    // State for image parameters values
    const [parameterValues, setParameterValues] = useState({
      seed: 0,
      width: 600,
      height: 600,
      nologo: true,
      private: true,
      enhance: false,
      safe: false,
    });

    const handleParameterChange = (key, value) => {
      setParameterValues((prev) => ({ ...prev, [key]: value }));  //change parameter values dynamically
    };  

     // Function to generate the parameterLink string
    const generateParameterLink = () => {
    let params = [];

    // Add parameters conditionally based on their values
    if (parameterValues.seed !== 0) params.push(`seed=${parameterValues.seed}`);
    if (parameterValues.width !== 0) params.push(`width=${parameterValues.width}`);
    if (parameterValues.height !== 0) params.push(`height=${parameterValues.height}`);
    if (parameterValues.nologo) params.push(`nologo=true`);
    if (parameterValues.private) params.push(`private=true`);
    if (parameterValues.enhance) params.push(`enhance=true`);
    if (parameterValues.safe) params.push(`safe=true`);

    // Join the parameters with '&' and return the final query string
    return params.length > 0 ? `?${params.join("&")}` : "";
  };
  const parameterLink = generateParameterLink();


  const [prompt, setPrompt] = useState(""); //to store input field text in realtime
  const [imageResultUrl, setImageResultUrl] = useState("");

  /*
  useEffect(() => {
    console.log("Current model:", currentImageModel);
    console.log("Parameter:", parameterValues);
    console.log("Prompt Text:", prompt);
    console.log("ParameterLink Text:", parameterLink);
  }, [prompt]) */


  const handleSubmit = async(e) =>{
    e.preventDefault();
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}${parameterLink}&model=${currentImageModel}`; 
    setImageResultUrl(imageUrl); //store image result url so that i can be used in img tag directly
  }

  
  return (
    <div className="gen-image-page">
      <aside className="sidemenu">
        <button className="clear-images-button" onClick={(e) => setImageResultUrl("")}>Clear Image</button>
        <div className="models">
          <h2>Select Model:</h2>
          <select onChange={(e)=> {const selectedIndex = e.target.value; setCurrentImageModel(imageModels[selectedIndex].name) }}>
            {imageModels.map((model, index) => (
              <option key={index} value={index}> {model.name} </option>
            ))}
          </select>
        </div>
        
        <div className="parameters">
          <h3>Parameters</h3>
          <div className="parameter-item">
            <label>Seed:</label>
            <input
              type="number"
              value={parameterValues.seed}
              onChange={(e) => handleParameterChange("seed", parseInt(e.target.value))}
            />
          </div>
          <div className="parameter-item">
            <label>Width:</label>
            <input
              type="number"
              value={parameterValues.width}
              onChange={(e) =>
                handleParameterChange("width", parseInt(e.target.value))
              }
            />
          </div>
          <div className="parameter-item">
            <label>Height:</label>
            <input
              type="number"
              value={parameterValues.height}
              onChange={(e) =>
                handleParameterChange("height", parseInt(e.target.value))
              }
            />
          </div>
          <div className="parameter-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={parameterValues.nologo}
                onChange={(e) => handleParameterChange("nologo", e.target.checked)}
              />
              No Logo
            </label>
          </div>
          <div className="parameter-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={parameterValues.private}
                onChange={(e) =>
                  handleParameterChange("private", e.target.checked)
                }
              />
              Private
            </label>
          </div>
          <div className="parameter-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={parameterValues.enhance}
                onChange={(e) =>
                  handleParameterChange("enhance", e.target.checked)
                }
              />
              Enhance
            </label>
          </div>
          <div className="parameter-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={parameterValues.safe}
                onChange={(e) => handleParameterChange("safe", e.target.checked)}
              />
              Safe Mode
            </label>
          </div>
        </div>

        <Link to="/" className="text-link">Others: Text or Image to Text</Link>
      </aside>

     
      <section className="content-area">

       <div className="generated-image-container">
        {/*If imageUrl is not empty then display image with img tag*/}
        {imageResultUrl && <img src={imageResultUrl} alt="Generated" />} 
       </div>

       <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          placeholder="Type your text here"
          className="text-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button className="generate-button" onClick={handleSubmit}>Generate Image</button>
       </form>
      </section>
    </div>
  );
}

export default GenImagePage;
