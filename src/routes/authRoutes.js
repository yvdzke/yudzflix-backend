const router = require("express").Router();
const authController = require("../controllers/authController");

// 🔥 IMPORT MIDDLEWARE (SATPAM)
// Pastikan path-nya sesuai dengan lokasi file middleware kamu
// Kalau file kamu namanya 'authMiddleware.js' ada di folder middleware:
const verifyToken = require("../middlewares/authMiddleware");

// --- PUBLIC ROUTES (Bisa diakses siapa aja) ---
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify", authController.verifyEmail);

// --- PROTECTED ROUTES (Harus bawa Token) ---
// Method: PUT (karena kita meng-update data)
// Alur: Cek Token Dulu (verifyToken) -> Baru Update (updateProfile)
router.put("/profile", verifyToken, authController.updateProfile);

module.exports = router;
