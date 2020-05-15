let express = require("express");
let router = express.Router();
let request = require("request");
let fs = require('fs');
let sharp = require('sharp');
const apiBaseUrl = "http://127.0.0.1:8000/smartfit/";
let ImageUrl = "http://localhost:7000/";
const im = require('imagemagick');
const { spawn } = require("child_process");
const path = require('path')
const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib/callback_api');

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
  //res.render("clothesTryOnResult");
  console.log(req.query.id)
  res.render('clothesTryOnResult', {id : req.query.id});
});

router.get("/ready", function (req, res, next) {
  console.log(req.query.id,'id found');
  var id = `${req.query.id}`;
  var isReady = false;
  const outputPath = `./public/output/output_${id}.png`;
  console.log(process.cwd());
  console.log(outputPath);
  try {
    if (fs.existsSync(outputPath)) {
      console.log("found");
      isReady = true;
    }
  } catch(err) {
    console.error(err)
  }
    res.json({isReady});
});


// @route   POST /getImagePrediction
// @desc    Call Python Script, to get the clothes try on result for the selected cloth
// @access  Private
router.post("/getClothTryOnResults", function (req, res) {
  try {
    var id = uuidv4();
    var dataImage = req.body.person;
    var selectedCloth = req.body.selectedCloth;
    console.log("selectedCloth", selectedCloth);
   // queueMessage(id);
    var buf = Buffer.from(dataImage, 'base64')
    // console.log(buf)
    fs.writeFile(`./input/temp_base64_${id}.jpg`,buf , err => {
      if (err) throw err;
      console.log('Saved!');
      var data = {
        dataImage: `./input/temp_base64_${id}.jpg`,
        selectedCloth: req.body.selectedCloth,
        id: id
     };
      console.log(data) 
      queueMessage(JSON.stringify(data));
      res.json({id});	    
      /*im.convert([`./input/temp_base64_${id}.jpg`, '-alpha', 'off', `./noalpha/temp_noalpha_${id}.jpg`],
      function(err, stdout){
        if (err) console.log(err);
        console.log('stdout:', stdout);
        var param1 = `./noalpha/temp_noalpha_${id}.jpg`
        var param2 = 'public/images/clothes/'+selectedCloth
        var cmd = '../back-end/ClothesTryOn/smartfit/run_smartfit.sh'
        console.log(process.cwd());
        console.log(cmd);
        const smartfit = spawn(cmd, [param1, param2, id]);
        smartfit.stdout.on('data', (data) => {
          //console.log(`stdout: ${data}`);
        });
        smartfit.stderr.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });
        smartfit.on('error', function (error) {
            // exit code is code
            console.log(error);
        });
        smartfit.on('close', function (code) {
            // exit code is code
            console.log('finished', code);
            res.json({id});
        });
      })*/
    });
  } catch (e) {
    console.log("Error", e);
    res.send(e);
  }
});

const queueMessage = (msg) => {
  const uri = 'amqp://admin:admin@localhost:5672/VTO';
  amqp.connect(uri, function(error0, connection) {
    if (error0) {
       console.log(error0);
      throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = 'hello';

      channel.assertQueue(queue, {
        durable: false
      });

      channel.sendToQueue(queue, Buffer.from(msg));
      console.log(" [x] Sent %s", msg);
    });
  });
}
/*router.post("/getClothTryOnResults", function (req, res) {
  try {

    var dataImage = req.body.person;
    var selectedCloth = req.body.selectedCloth;
    console.log("selectedCloth", selectedCloth);

    fs.writeFile('temp_base64.jpg', dataImage, err => {
      if (err) throw err;
      console.log('Saved!');
      setTimeout(()=> {
              console.log("***********in timeout function of callPythonAPI....")
              callPythonApi(selectedCloth, req, res);},6000)
      // setTimeout(()=> {
      //   sharp('temp.jpg')
      //   .removeAlpha()
      //   .toFile('temp_rgb.jpg', function(err, info) {
      //     if (err) throw err;
      //     console.log('removed alpha!');
      //     setTimeout(()=> {
      //       console.log("***********in timeout function of callPythonAPI....")
      //       callPythonApi(selectedCloth, req, res);},3000)
      //     // rgb.png is a 3 channel image without an alpha channel
      //   });
      // }, 4000) 
    });    
  } catch (e) {
    console.log("Error", e);
    res.send(e);
  }
});*/

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
              // setTimeout(()=> {
              console.log("In timeout...")
              console.log("******** Be ready.. Your Beautiful Picture on way to be displayed..... ")
              res.redirect("/clothes-try-on/view/");
            // }, 5000) 
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
