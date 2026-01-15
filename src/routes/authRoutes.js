const router = require("express").Router();
const authController = require("../controllers/authController");

// Import Middleware untuk verifikasi token kang jegal
const verifyToken = require("../middlewares/authMiddleware");

// public routes kaga perlu token
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify", authController.verifyEmail);

// protected routes perlu token
router.put("/profile", verifyToken, authController.updateProfile);

module.exports = router;
