const router = require("express").Router();
const userController = require("../controllers/userController");
// Import Satpam tadi
const verifyToken = require("../middlewares/authMiddleware");

// Pasang 'verifyToken' sebelum 'userController'
// Artinya: Cek token dulu, baru boleh ambil data
router.get("/", verifyToken, userController.getAllUsers);

module.exports = router;
