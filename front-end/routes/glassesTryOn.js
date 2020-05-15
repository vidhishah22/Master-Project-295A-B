let express = require("express");
let router = express.Router();

// @route   GET /
// @desc    Render Glasses Try On Page
// @access  Public
router.get("/", function(req, res, next) {
  res.render("glassesTryOn");
});

module.exports = router;