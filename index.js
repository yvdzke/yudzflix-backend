require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const favoriteRoutes = require("./src/routes/favoriteRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  // "http://192.168.1.10:5173",
  "https://yudzflix.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin); // Buat debug di log render
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Enable cookies and auth headers
  })
);
// ---------------------------------------------

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/favorites", favoriteRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Yvdzflix Backend Connected & Secured 🔒</h1>");
});

// Start Server
app.listen(PORT, () => console.log(`Yvdzflix Backend Connected ${PORT} 🚀`));
