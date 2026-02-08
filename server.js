import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cookieParser from "cookie-parser";
import businessesRoute from "./modules/businesses/businesses.route.js";
import jobRoute from "./modules/careers/jobs/job.route.js";
import applicationRoute from "./modules/careers/applications/application.route.js";

dotenv.config();
const app = express();

// Basic env validation (fail-fast or warn when critical values are missing)
const requiredEnvs = ["MONGO_URI", "FRONTEND_URL", "ADMIN_URL", "FRONTEND_URL_LOCAL", "ADMIN_URL_LOCAL"];
const missing = requiredEnvs.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn(`Warning: Missing required env vars: ${missing.join(", ")}. ` +
    "This may cause incorrect behavior or expose endpoints to unintended origins.");
}

// Security middlewares
app.use(helmet());

// Basic rate limiter (adjust limits as needed)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use(limiter);

// CORS Middleware (before any route)
const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL, process.env.FRONTEND_URL_LOCAL, process.env.ADMIN_URL_LOCAL].filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : false,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth))

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use("/api/businesses", businessesRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/applications", applicationRoute);





// Health check route - only for the root path
app.get("/api/health", (req, res) => {
  res.json({ message: "API is healthy and running..." });
});

// 404 Handler for unmatched routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global error handler (do not leak stack in production)
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong";

  // Log server-side for debugging (doesn't alter response payload)
  console.error(err);

  const payload = {
    success: false,
    status: errorStatus,
    message: errorMessage,
  };

  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(errorStatus).json(payload);
});


// If running behind a proxy/load balancer, trust first proxy so secure cookies work
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const port = process.env.PORT || 8800;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();