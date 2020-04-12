let express = require("express");
let router = express.Router();

// @route   GET /
// @desc    Render Clothes Try On Page
// @access  Public
router.get("/", function(req, res, next) {
  res.render("clothesTryOn");
});

module.exports = router;