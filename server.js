import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/mongoDbConfig.js";
import userRoute from "./routes/userRoutes.js"
import productRoute from "./routes/productRoutes.js";
import cartRoute from "./routes/cartRoutes.js";
import favoriteRoute from "./routes/favoriteRoutes.js";
import orderRoute from "./routes/orderRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8000; 

// CORS policy
app.use(cors());

// JSON
app.use(express.json());

// Loading Routes
app.use("/api/users",userRoute);
app.use("/api/products",productRoute);
app.use("/api/carts",cartRoute);
app.use("/api/favorites",favoriteRoute);
app.use("/api/orders",orderRoute);

// MongoDB Connection
const uri = process.env.DB_URI;
connectDB(uri);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});