let express = require("express");
let router = express.Router();

// @route   GET /
// @desc    Render Default Page
// @access  Public
router.get("/", function(req, res, next) {
    res.render("default");
});

module.exports = router;