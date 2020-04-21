let express = require("express");
let router = express.Router();

// @route   GET /
// @desc    Render Change Hair Color Page
// @access  Public
router.get("/", function(req, res, next) {
  res.render("changeHairColor");
});

module.exports = router;