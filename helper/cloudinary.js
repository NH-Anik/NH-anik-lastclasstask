import dotenv from 'dotenv'
// config dotenv 
dotenv.config()
import { v2 as cloudinary } from 'cloudinary';

// Configuring Cloudinary with cloud name, API key, and API secret
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;