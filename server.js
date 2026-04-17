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
import AdminRouter from "./modules/admin/admin.route.js";
import MembarRouter from "./modules/admin/member/membar.route.js";
import uploadRouter from "./modules/upload/upload.route.js";
                
dotenv.config();
const app = express();
                        
// If running behind a proxy/load balancer (like Vercel), trust first proxy so secure cookies and protocol detection work
app.set('trust proxy', 1);

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
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);

      if (process.env.NODE_ENV !== "production") {
        try {
          const hostname = new URL(origin).hostname;
          if (hostname === "localhost" || hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname.startsWith("172.")) {
            return callback(null, true);
          }
        } catch (e) {
          // invalid url
        }
      }
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Middleware to fix malformed URLs with leading spaces (e.g. from client-side typos)
app.use((req, res, next) => {
  if (req.url.startsWith('/%20')) {
    req.url = req.url.replace('/%20', '/');
  }
  next();
});


// Middleware to mask origin for better-auth when testing locally from other devices
app.use("/api/auth", (req, res, next) => {
  if (process.env.NODE_ENV !== "production" && req.headers.origin) {
    try {
      const hostname = new URL(req.headers.origin).hostname;
      if (hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname.startsWith("172.")) {
        // Mask the origin to localhost so better-auth accepts it as trusted
        req.headers.origin = "http://localhost:3000";
      }
    } catch (e) { }
  }
  next();
});

app.all("/api/auth/*splat", toNodeHandler(auth))

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use("/api/businesses", businessesRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/applications", applicationRoute);
app.use("/api/admin", AdminRouter);
app.use("/api/members", MembarRouter);

app.use("/api/upload", uploadRouter);
// Health check route - only for the root path
app.get("/api/health", (req, res) => {
  res.json({ message: "API is healthy and running..." });
});

// 404 Handler for unmatched routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Global error handler (do not leak stack in production)
app.use((err, req, res, next) => {
  // Handle Mongoose validation errors specifically to return a 400 status.
  // This keeps controller logic cleaner.
  if (err.name === 'ValidationError') {
    err.status = 400;
  }

  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong";

  // Log server-side for debugging (doesn't alter response payload)
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

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


// ... deleted from here

const port = process.env.PORT || 8800;

const startServer = async () => {
  try {
    // when running tests we manage the connection manually via in-memory server
    if (process.env.NODE_ENV !== 'test') {
      await connectDB();
    }
    if (process.env.NODE_ENV !== 'test') {
      app.listen(port, () => {
        console.log(`🚀 Server is running at http://localhost:${port}`);
      });
    }
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();

export default app;