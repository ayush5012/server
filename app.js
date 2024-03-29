import express from "express";
import {config} from "dotenv";
import cors from "cors"
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser"
config({
    path: "./data/config.env"   
})
export const app = express();

// Using Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        credentials: true,
        methods: ["GET", "PUT", "POST", "DELETE"],
        origin:[process.env.FRONTEND_URI_1, process.env.FRONTEND_URI_2],
    })
)
app.get("/",(req, res, next)=>{
    res.send("Working");
})

// Importing Routers here
import user from "./routes/user.js"
import product from "./routes/product.js"
import order from "./routes/order.js"

app.use("/api/v1/user", user)
app.use("/api/v1/product", product)
app.use("/api/v1/order", order)

// Using Error Middleware
app.use(errorMiddleware)