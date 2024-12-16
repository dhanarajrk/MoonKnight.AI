import React, { useRef } from 'react'
import { IKContext, IKUpload } from 'imagekitio-react';

const urlEndpoint = process.env.REACT_APP_IMAGE_KIT_ENDPOINT;
const publicKey = process.env.REACT_APP_IMAGE_KIT_PUBLIC_KEY; 
const authenticator =  async () => {
    try {
        const response = await fetch('http://localhost:3080/api/upload');

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const { signature, expire, token } = data;
        return { signature, expire, token };
    } catch (error) {
        throw new Error(`Authentication request failed: ${error.message}`);
    }
};


const Upload = ({setImg}) => {

    const ikUploadRef = useRef(null);

    const onError = err => {
        console.log("Error", err);
        setImg((prev)=>({ ...prev, isLoading: false, error: "Upload failed!" }));
      };
      
      const onSuccess = res => {
        console.log("Success", res);
        setImg((prev)=>({...prev, isLoading:false, dbData: res})) //When upload is succeed, change isLoading to false. and dbData as response
      };
      
      const onUploadProgress = progress => {
        console.log("Progress", progress);
      };
      
      const onUploadStart = evt => {
        console.log("Start", evt);
        setImg((prev)=>({...prev, isLoading:true})) //When upload starts, dont change anything but isLoading to true
      };
      

  return (
    <IKContext
        urlEndpoint={urlEndpoint}
        publicKey={publicKey}
        authenticator={authenticator}
      >
        <IKUpload
          fileName="test-upload.png"
          onError={onError}
          onSuccess={onSuccess}
          useUniqueFileName={true}
          onUploadProgress={onUploadProgress}
          onUploadStart={onUploadStart}
          style={{display: "none"}}
          ref={ikUploadRef}
        />
        {
          <label style={{width: 30, padding: 5, cursor: 'pointer'}} onClick={() => ikUploadRef.current.click()}>
            <img src="image_attach_icon.png" alt='Attach Photo'  style={{width: 20}}/>
          </label>  
        }
      </IKContext>
  )
}

export default Upload