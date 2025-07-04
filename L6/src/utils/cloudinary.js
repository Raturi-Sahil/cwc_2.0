import {v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({ 
        cloud_name: process.env.cloud_name, 
        api_key: process.env.api_key, 
        api_secret: process.env.api_secret // Click 'View API Keys' above to copy your API secret
});



// i say the reason why we haven't used the async wrapper here is so that our utils don't end up depending on each other. utilities are meant to be files/modules we can use on the fly, but for one to depend on the other will lead to increase in coupling.
const uploadOnCloudinary = async (localFilePath) => {
    
    try {
        if(!localFilePath) return null;// if the file path doesn't exist you can return simply.

        // if the path does exist
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // file has been uploaded successfully
        console.log("File has been uploaded successfully on cloudinary", response.url);
        return response;
    }catch(error) {
        fs.unlinkSync(localFilePath);
        // Remove the file locally as the upload operation failed. 
        return null;
    }
}

export {uploadOnCloudinary}