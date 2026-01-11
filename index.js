require("dotenv").config();
const express = require("express");
const cors = require("cors"); // <--- INI PENTING BUAT FRONTEND
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const favoriteRoutes = require("./src/routes/favoriteRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Izinkan Frontend akses Backend ini
app.use(express.json());

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/favorites", favoriteRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Yvdzflix Backend Connected</h1>");
});

// Start Server
app.listen(PORT, () => console.log(`Yvdzflix Backend Connected ${PORT} 🚀`));
