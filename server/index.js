import "./dotenv.config";
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import path from "path";
import favicon from "serve-favicon";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import schedule from "node-schedule";
import fs from "fs";

import router from "./router";

import MovieModel from "./Schemas/MoviesDatabase";

import socket from "./Helpers/socket";

const app = express();
const port = process.env.PORT || 3000;

const http = require("http").createServer(app);

app.set("root", "/");
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");

app.use(favicon(path.join(__dirname, "views", "favicon.ico")));
app.use("/public", express.static("public"));
app.use(morgan("dev"));
app.use(fileUpload());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* Webpack Hot Reload */

const webpack = require("webpack");
const webpackHotMiddleware = require("webpack-hot-middleware");
const webpackConfig = require("../webpack.config.js");

const compiler = webpack(webpackConfig);
const hotMiddleware = webpackHotMiddleware(compiler);

app.use(
  require("webpack-dev-middleware")(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath
  })
);

app.use(hotMiddleware);

schedule.scheduleJob("00 59 23 * * *", () => {
  console.log("Removing movies from server...");
  MovieModel.find({}, (err, result) => {
    const newDate = new Date();
    const thisMonth = newDate.getUTCMonth();
    const lastMonth = new Date();
    lastMonth.setUTCMonth(thisMonth - 1);
    result.map((movie) => {
      if (movie.lastViewed < lastMonth) {
        fs.unlinkSync(movie.path);
        MovieModel.remove({ _id: movie._id });
      }

      return undefined;
    });
    console.log("Removing from server is done!");
  });
});

/* eslint-enable */
/* ------------------ */

app.use("/api", router);
app.get("*", (req, res) => {
  res.render("index");
});

http.listen(port, () => {
  console.log(`Server running on ${port}`);
});

async function initIo() {
  await socket.init(http);
}

initIo();
