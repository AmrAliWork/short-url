const express = require("express");
const {
  createUrl,
  getAllUrl,
  getMainUrl,
  deleteUrl,
  getUrlStat,
  updateMainUrl,
} = require("../controllers/urlController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(protect);
router.route("/").post(createUrl).get(getAllUrl);
router.get("/:shortcode/statistics", getUrlStat);
router
  .route("/:shortcode")
  .patch(updateMainUrl)
  .get(getMainUrl)
  .delete(deleteUrl);
module.exports = router;
