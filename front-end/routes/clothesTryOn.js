let express = require("express");
let router = express.Router();
let request = require("request");
let fs = require('fs');
let sharp = require('sharp');
const apiBaseUrl = "http://127.0.0.1:8000/smartfit/";
let ImageUrl = "http://localhost:7000/";

// @route   GET /
// @desc    Render Clothes Try On Page
// @access  Public
router.get("/", function (req, res, next) {
  res.render("clothesTryOn");
});

// @route   GET /
// @desc    Render Clothes Try On Page
// @access  Public
router.get("/view", function (req, res, next) {
  res.render("clothesTryOnResult");
});


// @route   POST /getImagePrediction
// @desc    Call Python Script, to get the clothes try on result for the selected cloth
// @access  Private
router.post("/getClothTryOnResults", function (req, res) {
  try {

    var dataImage = req.body.person;
    var selectedCloth = req.body.selectedCloth;
    console.log("selectedCloth", selectedCloth);

    fs.writeFile('temp_base64.jpg', dataImage, err => {
      if (err) throw err;
      console.log('Saved!');
      setTimeout(()=> {
        sharp('temp.jpg')
        .removeAlpha()
        .toFile('temp_rgb.jpg', function(err, info) {
          if (err) throw err;
          console.log('removed alpha!');
          setTimeout(()=> {
            console.log("***********in timeout function of callPythonAPI....")
            callPythonApi(selectedCloth, req, res);},3000)
          // rgb.png is a 3 channel image without an alpha channel
        });
      }, 4000) 
    });    
  } catch (e) {
    console.log("Error", e);
    res.send(e);
  }
});

function callPythonApi(selectedCloth, req, res) {
  console.log("Python ML Api called");
  // console.log("STRINGYFY RESPONSE JSON", JSON.stringify(responseJson));

  // Call the python API, passing the responseJson data
  request(
    {
      method: "POST",
      uri: apiBaseUrl,
      form: { selectedCloth: selectedCloth },
      rejectUnauthorized: false
    },
    function(error, response, body) {
      if (error) {
        console.error("upload failed:", error);
      } else {
        let n = body.search("not found");

        if (n > 0) {
          res.send(error);
        } else {
          try {
            // Everything went right, and we get a response from the Python API
            console.log("RESPONSE:", response.statusCode);
            
            if(response.statusCode == 201){
              setTimeout(()=> {
              console.log("In timeout...")
              console.log("******** Be ready.. Your Beautiful Picture on way to be displayed..... ")
              res.redirect("/clothes-try-on/view/");
            }, 5000) 
          }
            else{
              console.log("Error", error);
            }
          } catch (e) {
            console.log("Error", e);
          }
        }
      }
    }
  );
}

module.exports = router;