// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const server = express();

// View engine setup
server.set("views", path.join(__dirname, "views"));
server.set("view engine", "ejs");

server.use(cookieParser());
server.use(express.static(path.join(__dirname, "public")));
server.use(cors());

// Allow access control, i.e., avoid CORS error
server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  next();
});

const homeRouter = require("./routes/home");

server.use("/", homeRouter);

const tryonRouter = require("./routes/tryon");

server.use("/", tryonRouter);

// // https://expressjs.com/en/starter/basic-routing.html
// app.get("/", (request, response) => {
//   response.sendFile(__dirname + "/views/glass_try_on.html");
// });

// send the default array of dreams to the webpage
server.get("/dreams", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(dreams);
});

module.exports = server;