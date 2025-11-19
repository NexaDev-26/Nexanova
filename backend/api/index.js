/**
 * NexaNova Backend – Render Deployment Version
 * Clean, stable, simplified & production-safe
 */

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

/* ------------------------------
   CORS CONFIG (Render Friendly)
--------------------------------*/
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://nexanova.vercel.app",
  /\.vercel\.app$/,
  /\.onrender\.com$/,
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // mobile apps & curl

    const allowed = allowedOrigins.some((rule) =>
      rule instanceof RegExp ? rule.test(origin) : rule === origin
    );

    if (allowed) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("CORS not allowed"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(cors(corsOptions));

/* ------------------------------
   EXPRESS MIDDLEWARE
--------------------------------*/
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ------------------------------
   SECURITY HEADERS
--------------------------------*/
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.removeHeader("X-Powered-By");
  next();
});

/* ------------------------------
   HEALTH CHECK
--------------------------------*/
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "NexaNova Backend is running 👑",
    time: new Date().toISOString(),
  });
});

/* ------------------------------
   DATABASE INIT (SQLite/MySQL)
--------------------------------*/
let db = null;
try {
  db = require("./config/database");
  console.log("✅ Database loaded successfully");
} catch (err) {
  console.log("❌ Failed to load database:", err.message);
}

/* ------------------------------
   SUPABASE INIT
--------------------------------*/
let supabase = null;
try {
  const sb = require("./config/supabase");
  supabase = sb.supabase;
  console.log("✅ Supabase client initialized");
} catch (err) {
  console.log("❌ Supabase failed to initialize:", err.message);
}

/* ------------------------------
   ROUTES LOADING
--------------------------------*/
const routeList = [
  { path: "/auth", file: "./routes/auth" },
  { path: "/password-reset", file: "./routes/passwordReset" },
  { path: "/habits", file: "./routes/habits" },
  { path: "/finance", file: "./routes/finance" },
  { path: "/chat", file: "./routes/chat" },
  { path: "/rewards", file: "./routes/rewards" },
  { path: "/user", file: "./routes/user" },
  { path: "/journal", file: "./routes/journal" },
];

routeList.forEach((route) => {
  try {
    const router = require(route.file);
    app.use(route.path, router);
    console.log(`✅ Route loaded → ${route.path}`);
  } catch (err) {
    console.log(`❌ Failed to load route ${route.path}:`, err.message);
  }
});

/* ------------------------------
   404 HANDLER
--------------------------------*/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.path} not found`,
  });
});

/* ------------------------------
   ERROR HANDLER
--------------------------------*/
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);

  res.status(500).json({
    success: false,
    error: err.message,
  });
});

/* ------------------------------
   START SERVER (Render)
--------------------------------*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 NexaNova Backend running on port ${PORT}`);
});

module.exports = app;
