import express from "express";///ownerRoutes
import { protect } from "../middleware/auth.js";
import { addProduct, changeRoleToOwner, deleteProduct, getDashboardData, getOwnerProduct, toggleProductAvailability, updateUserImage } from "../controllers/ownerController.js";
import upload from "../middleware/multer.js";


const ownerRouter = express.Router();

ownerRouter.post("/change-role", protect, changeRoleToOwner)
ownerRouter.post("/add-product", protect, upload.single("image"), addProduct)
ownerRouter.get("/products", protect,getOwnerProduct)
ownerRouter.post("/toggle-product", protect,toggleProductAvailability)
ownerRouter.post("/delete-product", protect, deleteProduct)


ownerRouter.get('/dashboard',protect,getDashboardData)
ownerRouter.post('/update-image',protect,upload.single("image"),updateUserImage)

export default ownerRouter;
