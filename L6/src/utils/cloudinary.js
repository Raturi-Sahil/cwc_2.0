import {v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
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
        fs.unlinkSync(localFilePath);
        return response;
    }catch(error) {
        console.log("cloudinary upload failed", error);
        fs.unlinkSync(localFilePath);
        // Remove the file locally as the upload operation failed. 
        return null;
    }
}

export {uploadOnCloudinary}