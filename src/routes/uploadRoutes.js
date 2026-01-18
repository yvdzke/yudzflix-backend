const express = require("express");
const router = express.Router();

// 1. Panggil Controller (Logika upload ke Cloudinary)
const { uploadImage } = require("../controllers/uploadController");

// 2. Panggil Middleware (Nangkap file dari request)
const upload = require("../middlewares/upload");
// 3. Route Upload Image ke Cloudinary
router.post("/", upload.single("file"), uploadImage);

module.exports = router;
