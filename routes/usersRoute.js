const express = require("express");
const {
  getUser,
  updatePassword,
  updateUser,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const loginLimiter = require("../middlewares/rateLimitMiddleware");
const { login, signUp } = require("../controllers/authController");
const router = express.Router();
router.post("/login", loginLimiter, login);
router.post("/signup", signUp);
router.use(protect);
router.route("/me").get(getUser).patch(updateUser);
router.patch("/me/update-password", updatePassword);

module.exports = router;
