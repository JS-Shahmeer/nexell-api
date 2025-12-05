import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import contactRoute from "./routes/contact.js";

dotenv.config();

const app = express();

// Allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5000",
  "http://localhost:5001",
  "http://localhost:5002",
  "https://nexellbookwriting.com"
];

// Handle OPTIONS preflight requests FIRST - before CORS middleware
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;
    console.log(`OPTIONS preflight request from: ${origin || 'no origin'}`);
    
    if (origin && allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Max-Age", "86400");
      console.log(`✅ OPTIONS preflight allowed for: ${origin}`);
      return res.status(204).send();
    } else if (!origin) {
      // No origin header
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");
      return res.status(204).send();
    } else {
      console.log(`❌ OPTIONS preflight blocked for: ${origin}`);
    }
  }
  next();
});

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Log for debugging
    console.log(`Incoming request from origin: ${origin || 'no origin'}`);
    
    // Allow requests with no origin (like Postman, mobile apps, or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ Origin allowed: ${origin}`);
      return callback(null, true);
    } else {
      console.log(`❌ Origin blocked: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Middleware to parse JSON
app.use(express.json());

// Explicit OPTIONS handler for contact route (extra safety)
app.options("/api/contact", (req, res) => {
  const origin = req.headers.origin;
  console.log(`Explicit OPTIONS handler for /api/contact from: ${origin || 'no origin'}`);
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400");
    return res.status(204).send();
  }
  res.status(403).send();
});

// Routes
app.use("/api/contact", contactRoute);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
