import './normalize.css';
import './App.css';
import {useState, useEffect} from 'react';

function App() {

  //getEngines to run as soon as page loads to get all the models ready
  useEffect(() => {
    getEngines();
  }, [])

  const [models, setModels] = useState([])
  const [currentModel, setCurrentModel] = useState(null)  // to store selected model name so that its name can be used in backend to know which model is selected

  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);//useState([ {user: "gpt", message: "How can I help you today?"}, {user: "Me", message: "I want to use ChatGPT"} ]);

  //clear chatLogs
  const clearChat = () =>{
    setChatLog([]);
  }

  async function getEngines() {
    try {
      const response = await fetch("http://localhost:3080/models"); //GET request
  
      const data = await response.json();
      //console.log(data); 
      setModels(data.models); //Also store data.models in models state.

      setCurrentModel(data.models[0]); //If user didn't select any model. I want to to set the first model in the models data array to be the default model before submitting msg

    } catch (error) {
      console.error("Error fetching models:", error);
    }
  }


  const handleSubmit = async(e) =>{
    e.preventDefault();
    console.log(currentModel);

    //Since setChatLog is asynchronous and does not immediately update the state, I use a temporary variable to hold the updated chatLog before making the API call
    const updatedChatLog = [...chatLog, { user: "Me", message: input }]; //Create a new chat log including the current input
    setChatLog(updatedChatLog);

    setInput("");

    //passing chatLog messages to fetch response from backend API
    const response = await fetch("http://localhost:3080/",{
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        message: updatedChatLog.map((entry) => entry.message).join("\n") ,    //Sending all messages in new line format with join("\n")
        currentModel                                                          //also send selected currentModel 
      })
    });
    const data = await response.json();
    setChatLog([...updatedChatLog, { user: "gpt", message: `${data.message}`}]) //store response from gpt in updatedChatLog and then store in chatLog
    //console.log(data.message);
    
  }

  return (
    <div className="App">
      <aside className='sidemenu'>
        <div className='side-menu-button' onClick={clearChat}>
          <span>+</span>
          New Chat
        </div>
        <div className='models'>
          <h2>Select model:</h2>
          <select onChange={(e) => {const selectedIndex = e.target.value; setCurrentModel(models[selectedIndex])} } >  
            {models.map((model, index) => (
              <option key={index} value={index}> {model.name} </option>   //If I can get the index of the selected model, then I can setCurrentModel(models[selectedIndex]) and sent it to backend so that all object properties like currentModel.id , .name , .max_token_completions can be accessed
            ))}
          </select>
        </div>
      </aside>
      <section className='chatbox'>
        <div className='chat-log'>
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </div>
        <div className='chat-input-holder'>
          <form onSubmit={handleSubmit}>
            <input rows='1' className='chat-input-textarea' placeholder='Type your message here' value={input} onChange={(e) => setInput(e.target.value)}></input>
          </form>
        </div>
      </section>
    </div>
  );
}

const ChatMessage = ({message}) => {
  return(
    <div className={`chat-message ${message.user === "gpt" && "chatgpt"}`}>
            <div className={`chat-message-center ${message.user === "gpt" && "chatgpt"}`}>
             <div className={`avatar ${message.user === "gpt" && "chatgpt"}`}></div>
             <div className='message'>{message.message}</div>
            </div>
          </div>
  )
}

export default App;
