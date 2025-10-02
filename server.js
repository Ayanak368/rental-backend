import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";

//Initialize Express App
const app = express()

//connect database
await connectDB()

//MiddleWare
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send("Server is running succes"))

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=> console.log(`server running on port ${PORT}`))