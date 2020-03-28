let express = require("express");
let router = express.Router();

// @route   GET /
// @desc    Render Home Page
// @access  Public
router.get("/", function(req, res, next) {
  res.render("glass_try_on");
});

module.exports = router;