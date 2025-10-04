import express from "express";///ownerRoutes
import { protect } from "../middleware/auth.js";
import { addProduct, changeRoleToOwner } from "../controllers/ownerController.js";
import upload from "../middleware/multer.js";


const ownerRouter = express.Router();

ownerRouter.post("/change-role", protect, changeRoleToOwner)
ownerRouter.post("/add-product", protect, upload.single("image"), addProduct);

export default ownerRouter;
