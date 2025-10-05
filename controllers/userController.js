import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Product from "../models/Product.js";

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" }); // token valid for 7 days
};

// Register user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password || password.length < 8) {
            return res.json({ 
                success: false, 
                message: "Fill all fields and password must be at least 8 characters" 
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });
        const token = generateToken(user._id.toString());

        // send user data also (without password)
        const { password: pwd, ...userWithoutPassword } = user._doc;

        res.json({ success: true, token, user: userWithoutPassword });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = generateToken(user._id.toString());

        // send user data also
        const { password: pwd, ...userWithoutPassword } = user._doc;

        res.json({ success: true, token, user: userWithoutPassword });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get user data using Token (JWT)
export const getUserData = async (req, res) => {
    try {
        if (!req.user) {
            return res.json({ success: false, message: "User not authenticated" });
        }

        // Exclude password before sending
        const { password, ...userWithoutPassword } = req.user._doc;

        res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Get all products for the frontend
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isAvailable: true });
        res.json({ success: true, products });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
