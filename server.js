// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const server = express();

// View engine setup
server.set("views", path.join(__dirname, "views"));
server.set("view engine", "ejs");

server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ limit: '50mb' }));
server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));

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

const defaultRouter = require("./routes/default");
const homeRouter = require("./routes/home");
const glassesTryOnRouter = require("./routes/glassesTryOn");
const clothesTryOnRouter = require("./routes/clothesTryOn");
const changeHairColorRouter = require("./routes/changeHairColor");

server.use("/", defaultRouter);
server.use("/home", homeRouter);
server.use("/glasses-try-on", glassesTryOnRouter);
server.use("/clothes-try-on", clothesTryOnRouter);
server.use("/change-hair-color", changeHairColorRouter);

module.exports = server;