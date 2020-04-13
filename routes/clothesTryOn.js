let express = require("express");
let router = express.Router();
let request = require("request");
let fs = require('fs');

// @route   GET /
// @desc    Render Clothes Try On Page
// @access  Public
router.get("/", function (req, res, next) {
  res.render("clothesTryOn");
});

// @route   POST /getImagePrediction
// @desc    Call Python Script, to get the clothes try on result for the selected cloth
// @access  Private
router.post("/getClothTryOnResults", function (req, res) {
  try {

    var dataImage = req.body.person;
    fs.writeFile('temp_base64.png', dataImage, err => {
      if (err) throw err;
      console.log('Saved!');
    });
    // pythonApiData(id, selectedTrainingAlgo, selectedModel, req, res);
  } catch (e) {
    console.log("Error", e);
    res.send(e);
  }
});

module.exports = router;