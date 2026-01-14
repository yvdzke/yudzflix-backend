const router = require("express").Router();

// Import Service (Satpam) & Controller (Resepsionis)
const upload = require("../services/uploadService");
const uploadController = require("../controllers/uploadController");

// --- DEFINISI ROUTE ---
// Method: POST
// Middleware: upload.single("file") -> Artinya cuma boleh upload 1 file, dan nama field-nya harus "file"
router.post("/", upload.single("file"), uploadController.uploadImage);

module.exports = router;
