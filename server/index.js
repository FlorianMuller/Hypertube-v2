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
import mongoose from "./mongo";

import passportGoogle from "./Helpers/omniauth/google";
import passport42 from "./Helpers/omniauth/42";
import apiRouter from "./router";

import MovieModel from "./Schemas/MoviesDatabase";
import SearchCache from "./Schemas/SearchCache";

import socket from "./Helpers/socket";

const app = express();
const port = process.env.PORT || 3000;

const http = require("http").createServer(app);

app.set("root", "/");
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");

// Middleware

app.use(favicon(path.join(__dirname, "views", "favicon.ico")));
app.use("/public", express.static("public"));
app.use(morgan("dev"));
app.use(fileUpload());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passportGoogle.initialize());
app.use(passport42.initialize());

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

const Movie = mongoose.model("Movie", MovieModel);

schedule.scheduleJob("00 59 23 * * *", () => {
  console.log("Removing movies from server...");
  const lastMonth = new Date().setUTCMonth(new Date().getUTCMonth() - 1); // Last month
  Movie.find({ lastViewed: { $lte: lastMonth } }, (err, result) => {
    result.forEach((movie) => {
      Movie.findByIdAndRemove({ _id: movie._id });
      fs.unlinkSync(movie.path); // Delete movie repo
    });
  });
  console.log("Removing from server is done!");
});

schedule.scheduleJob("59 * * * * *", async () => {
  console.log("Deleting search caches...");
  const limitDate = new Date(Date.now() - 20 * 60000); // 20 minutes ago;
  await SearchCache.deleteMany({ createdAt: { $lte: limitDate } });
  console.log("Deleting search caches done !");
});

/* eslint-enable */
/* ------------------ */

// Routing

app.use("/api", apiRouter);
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
