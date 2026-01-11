const router = require("express").Router();
const favoriteController = require("../controllers/favoriteController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/", verifyToken, favoriteController.getFavorites);
router.post("/", verifyToken, favoriteController.addFavorite);
router.delete("/:id", verifyToken, favoriteController.removeFavorite);

module.exports = router;
