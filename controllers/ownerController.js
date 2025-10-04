import imagekit from "../configs/imagekit.js";
import User from "../models/User.js";
import fs from "fs";
import Product from "../models/Product.js";
import Booking from "../models/Booking.js";

// API to change role of the user
export const changeRoleToOwner = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { role: "owner" });
    res.json({ success: true, message: "Now you can list product" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to add product
export const addProduct = async (req, res) => {
  try {
    const { _id } = req.user;
    let product = JSON.parse(req.body.productData);
    const imageFile = req.file;

    // Upload image to ImageKit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/products",
    });

    // Optimized URL
    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [{ width: "1280" }, { quality: "auto" }, { format: "webp" }],
    });

    await Product.create({ ...product, owner: _id, image: optimizedImageUrl });

    res.json({ success: true, message: "Product added" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to list owner products
export const getOwnerProduct = async (req, res) => {
  try {
    const { _id } = req.user;
    const products = await Product.find({ owner: _id });
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to toggle product availability
export const toggleProductAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { productId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    if (product.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    res.json({ success: true, message: "Availability Toggled" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { _id } = req.user;
    const { productId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    if (product.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    product.owner = null;
    product.isAvailable = false;
    await product.save();

    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const products = await Product.find({ owner: _id });
    const bookings = await Booking.find({ owner: _id })
      .populate("product")
      .sort({ createdAt: -1 });

    const pendingBookings = await Booking.find({ owner: _id, status: "pending" });
    const completedBookings = await Booking.find({ owner: _id, status: "confirmed" });

    const monthlyRevenue = bookings
      .filter((booking) => booking.status === "confirmed")
      .reduce((acc, booking) => acc + booking.price, 0);

    const dashboardData = {
      totalProducts: products.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to update user image
export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.user;
    const imageFile = req.file;

    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/users",
    });

    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [{ width: "400" }, { quality: "auto" }, { format: "webp" }],
    });

    await User.findByIdAndUpdate(_id, { image: optimizedImageUrl });
    res.json({ success: true, message: "Image Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
