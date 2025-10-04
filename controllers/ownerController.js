import imagekit from "../configs/imagekit.js";
import User from "../models/User.js"; ///ownerController
import fs from "fs";
import Product from "../models/Product.js";

//API to change roleof the user
export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { role: "owner" })
        res.json({ success: true, message: "Now you can list product" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}


//API to List Product
export const addProduct = async (req, res) => {
    try {
        const { _id } = req.user
        let product = JSON.parse(req.body.productData)
        const imageFile = req.file;

//upload image to image kit
        const fileBuffer = fs.readFileSync(imageFile.path)
       const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder:'/products'
       })
        
        // optimization through imagekit url transformation
       const optimizedImageUrl = imagekit.url({
        path: response.filePath,
        transformation: [
               { width: '1280' },//width resizing
            { quality: 'auto' },//auto compression
            {format:'webp'}//convert to modern format
        ]
       });
        
        const image = optimizedImageUrl;
        await Product.create({...product,owner:_id,image})
       
        res.json({success:true,message:"Product added"})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message }) 
    }
}