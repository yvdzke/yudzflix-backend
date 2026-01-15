const router = require("express").Router();

// Import Service upload
const upload = require("../services/uploadService");
const uploadController = require("../controllers/uploadController");

// Middleware: upload.single("file") -> Artinya cuma boleh upload 1 file, dan nama field-nya harus "file"
router.post("/", upload.single("file"), uploadController.uploadImage);

module.exports = router;
