const router = require("express").Router();
const userController = require("../controllers/userController");
// Import Satpam tadi
const verifyToken = require("../middlewares/authMiddleware");

// cek token terus ambil data user cuy, kalo kaga yah bakal ditolak
router.get("/", verifyToken, userController.getAllUsers);

module.exports = router;
