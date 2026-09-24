const express = require("express");
const router = express.Router();
const { openUrl } = require("../controllers/urlController");
router.get("/:shortcode", openUrl);
module.exports = router;
