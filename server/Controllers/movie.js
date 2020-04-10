import Axios from "axios";
import mime from "mime";
import TorrentStream from "torrent-stream";
import pump from "pump";
import fs from "fs";
import OS from "opensubtitles-api";
import download from "download";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import mongoose from "../mongo";
import ioConnection from "..";
import movieHelpers from "../Helpers/movie";

import MovieModel from "../Schemas/MoviesDatabase";

ffmpeg.setFfmpegPath(ffmpegPath);

const Movie = mongoose.model("Movie", MovieModel);

const OpenSubtitles = new OS({
  useragent: "noelledeur",
  username: "noelledeur",
  password: "Hypertube1234",
  ssl: true
});

const options = {
  connections: 100,
  uploads: 10,
  verify: true,
  path: "./server/data/movie/",
  tracker: true, // Whether or not to use trackers from torrent file or magnet link
  // Defaults to true
  trackers: [
    "udp://tracker.openbittorrent.com:80",
    "udp://tracker.ccc.de:80",
    "udp://tracker.leechers-paradise.org:6969/announce",
    "udp://tracker.pirateparty.gr:6969/announce",
    "udp://tracker.coppersurfer.tk:6969/announce",
    "http://asnet.pw:2710/announce",
    "http://tracker.opentrackr.org:1337/announce",
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://tracker1.xku.tv:6969/announce",
    "udp://tracker1.wasabii.com.tw:6969/announce",
    "udp://tracker.zer0day.to:1337/announce",
    "udp://p4p.arenabg.com:1337/announce",
    "http://tracker.internetwarriors.net:1337/announce",
    "udp://tracker.internetwarriors.net:1337/announce",
    "udp://allesanddro.de:1337/announce",
    "udp://9.rarbg.com:2710/announce",
    "udp://tracker.dler.org:6969/announce",
    "http://mgtracker.org:6969/announce",
    "http://tracker.mg64.net:6881/announce",
    "http://tracker.devil-torrents.pl:80/announce",
    "http://ipv4.tracker.harry.lu:80/announce",
    "http://tracker.electro-torrent.pl:80/announce"
  ]
};

const getSubtitles = async (req, res) => {
  const { imdbId } = req.params;

  let subPathEn;
  let subPathEs;
  let subPathFr;

  await OpenSubtitles.search({
    sublanguageid: ["fre", "eng", "spa"].join(),
    extensions: ["srt", "vtt"],
    imdbid: imdbId
  }).then(async (subtitles) => {
    const subPath = `${process.cwd()}/server/data/subtitles/`;

    if (
      subtitles.en &&
      subtitles.en.vtt &&
      !fs.existsSync(`${subPath + imdbId}_en.vtt`)
    ) {
      await download(subtitles.en.vtt)
        .then((data) => {
          fs.writeFileSync(`${subPath + imdbId}_en.vtt`, data);
        })
        .catch((err) => {
          console.error(err.message);
          console.log("No english subtitles");
        });
      subPathEn = fs.existsSync(`${subPath + imdbId}_en.vtt`)
        ? `${imdbId}_en.vtt`
        : undefined;
    } else if (fs.existsSync(`${subPath + imdbId}_en.vtt`)) {
      subPathEn = `${imdbId}_en.vtt`;
    }
    if (
      subtitles.es &&
      subtitles.es.vtt &&
      !fs.existsSync(`${subPath + imdbId}_es.vtt`)
    ) {
      await download(subtitles.es.vtt)
        .then((data) => {
          fs.writeFileSync(`${subPath + imdbId}_es.vtt`, data);
        })
        .catch(() => {
          console.log("No spanish subtitles");
        });
      subPathEs = fs.existsSync(`${subPath + imdbId}_es.vtt`)
        ? `${imdbId}_es.vtt`
        : undefined;
    } else if (fs.existsSync(`${subPath + imdbId}_es.vtt`)) {
      subPathEs = `${imdbId}_es.vtt`;
    }
    if (
      subtitles.fr &&
      subtitles.fr.vtt &&
      !fs.existsSync(`${subPath + imdbId}_fr.vtt`)
    ) {
      await download(subtitles.fr.vtt)
        .then((data) => {
          fs.writeFileSync(`${subPath + imdbId}_fr.vtt`, data);
        })
        .catch(() => {
          console.log("No french subtitles");
        });
      subPathFr = fs.existsSync(`${subPath + imdbId}_fr.vtt`)
        ? `${imdbId}_fr.vtt`
        : undefined;
    } else if (fs.existsSync(`${subPath + imdbId}_fr.vtt`)) {
      subPathFr = `${imdbId}_fr.vtt`;
    }
  });
  return res.status(200).json({ subPathEn, subPathEs, subPathFr });
};

const getInfos = async (req, res) => {
  if (req.params.imdbId === undefined)
    return res.satus(400).send({ error: "Votre requête ne comporte pas d'id" });

  const response = await Axios(
    `https://tv-v2.api-fetch.website/movie/${req.params.imdbId}`
  );
  let sourceUrl;
  let sourceSite;
  if (response.data._id !== undefined) {
    sourceUrl = "https://tv-v2.api-fetch.website/movie/";
    sourceSite = "popCornTime";
  } else {
    sourceUrl = "https://yts.ae/api/v2/movie_details.json?movie_id=";
    sourceSite = "yts";
  }
  let reviews;
  let infos;
  await Axios.get(sourceUrl + req.params.imdbId)
    .then(async (movieRes) => {
      let movie;
      if (sourceSite === "yts") movie = movieRes.data.data.movie;
      else movie = movieRes.data;
      infos = {
        title: movie.title,
        description:
          req.params.site === "yts" ? movie.description_full : movie.synopsis,
        prodDate: movie.year,
        runTime: movie.runtime,
        imdbRating:
          req.params.site === "yts"
            ? movie.rating / 2
            : movie.rating.percentage / 2,
        poster:
          req.params.site === "yts"
            ? movie.medium_cover_image
            : movie.images.poster,
        imdbid: req.params.site === "yts" ? movie.imdb_code : movie.imdb_id
      };
      reviews = await movieHelpers.findReviews(movie.id);
    })
    .catch((e) => {
      console.error(e.message);
      res.sendStatus(500);
    });
  return res.status(200).send({ infos, reviews });
};

const convertVideoDownload = (res, file) => {
  const stream = file.createReadStream();
  const newStream = ffmpeg({
    source: stream
  })
    .videoCodec("libvpx")
    .videoBitrate(1024)
    .audioCodec("libopus")
    .audioBitrate(128)
    .outputOptions([
      "-crf 30",
      "-deadline realtime",
      "-cpu-used 2",
      "-threads 3"
    ])
    .format("webm")
    .on("start", () => {
      console.log("Starting conversion...");
    })
    .on("end", () => {
      console.log("Conversion is done!");
    })
    .on("error", (err) => {
      console.log(`Cannot process video: ${err.message}`);
    });
  pump(newStream, res);
};

const streamMovieDownload = (file, start, end, res) => {
  if (
    mime.getType(file.name) !== "video/mp4" &&
    mime.getType(file.name) !== "video/ogg"
  ) {
    convertVideoDownload(res, file);
  } else {
    const stream = file.createReadStream({
      start,
      end
    });
    pump(stream, res);
  }
};

const convertVideo = (res, path) => {
  const stream = fs.createReadStream(path);
  const newStream = ffmpeg({
    source: stream
  })
    .videoCodec("libvpx")
    .videoBitrate(1024)
    .audioCodec("libopus")
    .audioBitrate(128)
    .outputOptions([
      "-crf 30",
      "-deadline realtime",
      "-cpu-used 2",
      "-threads 3"
    ])
    .format("webm")
    .on("start", () => {
      console.log("Starting conversion...");
    })
    .on("end", () => {
      console.log("Conversion is done!");
    })
    .on("error", (err) => {
      console.log(`Cannot process video: ${err.message}`);
    });

  pump(newStream, res);
};

const streamMovie = async (pathMovie, start, end, res) => {
  if (
    mime.getType(pathMovie) !== "video/mp4" &&
    mime.getType(pathMovie) !== "video/ogg"
  ) {
    convertVideo(res, pathMovie);
  } else {
    const stream = fs.createReadStream(pathMovie, {
      start,
      end
    });
    pump(stream, res);
  }
};

const downloadMovie = (movieId, movie, sourceSite, req, res) => {
  let magnetPopCorn;
  if (sourceSite !== "yts") {
    const quality = "720p";
    magnetPopCorn = movie.torrents.en[quality];
    magnetPopCorn = magnetPopCorn.url;
    [, , , magnetPopCorn] = magnetPopCorn.split(":");
    [magnetPopCorn] = magnetPopCorn.split("&");
  }

  const magnet =
    sourceSite === "yts"
      ? `magnet:?xt=urn:btih:${movie.torrents[0].hash}`
      : magnetPopCorn;

  const engine = TorrentStream(magnet, options);

  let newFilePath;
  let fileSize;

  engine
    .on("ready", () => {
      engine.files.forEach(async (file) => {
        let ext = file.name.substr(-4, 4);
        if (
          ext === ".mp4" ||
          ext === ".mkv" ||
          ext === ".avi" ||
          ext === ".ogg"
        ) {
          file.select();

          if (ext !== ".mp4" && ".ogg") ext = ".webm";

          fileSize = file.length;
          newFilePath = `${process.cwd()}/server/data/movie/${file.path}`;

          const { range } = req.headers;
          if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;

            const head = {
              "Content-Range": `bytes ${start}-${end}/${fileSize}`,
              "Accept-Ranges": "bytes",
              "Content-Length": chunksize,
              "Content-Type":
                mime.getType(file.name) === "video/mp4" ||
                  mime.getType(file.name) === "video/ogg"
                  ? mime.getType(file.name)
                  : "video/webm",
              Connection: "keep-alive"
            };
            if (
              mime.getType(file.path) === "video/mp4" ||
              mime.getType(file.path) === "video/ogg"
            )
              res.writeHead(206, head);
            streamMovieDownload(file, start, end, res);
          } else {
            const head = {
              "Content-Length": fileSize,
              "Content-Type":
                mime.getType(file.name) === "video/mp4" ||
                  mime.getType(file.name) === "video/ogg"
                  ? mime.getType(file.name)
                  : "video/webm"
            };
            res.writeHead(200, head);
            streamMovieDownload(file, 0, fileSize - 1, res);
          }
        } else {
          file.deselect();
        }
      });
    })
    .on("idle", async () => {
      console.log(`Download finish !`);
      const directory = newFilePath.split("/").reverse()[1];
      const fileName = newFilePath.split("/").reverse()[0];
      const path = `${process.cwd()}/server/data/movie/${directory}/${fileName}`;
      await Movie.create({
        movieId,
        movieName: movie.title,
        path
      });
    });
};

const PlayMovie = async (req, res) => {
  const movieId = req.params.imdbId;
  const response = await Axios(
    `https://tv-v2.api-fetch.website/movie/${req.params.imdbId}`
  );
  let sourceUrl = "";
  let sourceSite = "";
  if (response.data._id !== undefined) {
    sourceUrl = "https://tv-v2.api-fetch.website/movie/";
    sourceSite = "popCornTime";
  } else {
    sourceUrl = "https://yts.mx/api/v2/movie_details.json?movie_id=";
    sourceSite = "yts";
  }

  Axios.get(sourceUrl + movieId)
    .then(async (movieRes) => {
      const movie =
        sourceSite === "yts" ? movieRes.data.data.movie : movieRes.data;

      // Check if the movie is already download in the database
      Movie.findOne({ movieId }, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
        }
        if (result) {
          Movie.findOne({ movieId }, (error, movieFound) => {
            if (error) {
              console.error(error.message);
              return res.statu(500).send("Intenal server error");
            }
            let pathMovie = movieFound.path;
            ioConnection.ioConnection
              .to(movieId)
              .emit("Video source", pathMovie);
            pathMovie = `${process.cwd()}/server/data/movie/${
              movieFound.path.split("/").reverse()[1]
              }/${movieFound.path.split("/").reverse()[0]}`;
            const stat = fs.statSync(pathMovie);
            const fileSize = stat.size;
            let start = 0;
            let end = fileSize - 1;

            const { range } = req.headers;
            if (range) {
              const parts = range.replace(/bytes=/, "").split("-");
              start = parseInt(parts[0], 10);
              end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
              const chunksize = end - start + 1;

              const head = {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": mime.getType(pathMovie)
              };
              res.writeHead(206, head);
              streamMovie(pathMovie, start, end, res);
            } else {
              const head = {
                "Content-Length": fileSize,
                "Content-Type": mime.getType(movie.path)
              };
              res.writeHead(200, head);
              streamMovie(pathMovie, start, end, res);
            }
            return true;
          });
        } else {
          downloadMovie(movieId, movie, sourceSite, req, res);
        }
        return true;
      });
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
};

const receiveReviews = (req, res) => {
  const { movieId } = req.body;
  Axios.get(`https://yts.mx/api/v2/movie_details.json?movie_id=${movieId}`)
    .then(
      async ({
        data: {
          data: { movie }
        }
      }) => {
        if (movie.title && req.body.body && req.body.body.length < 1001) {
          const ret = await movieHelpers.saveReview({
            _id: new mongoose.Types.ObjectId(),
            movieId: req.body.movieId,
            movieName: movie.title,
            name: req.body.name,
            date: req.body.date,
            stars: req.body.stars,
            body: req.body.body
          });
          if (typeof ret !== "string") {
            const fullDate = String(new Date(req.body.date)).split(" ");
            ioConnection.ioConnection
              .to(req.body.movieId)
              .emit("New comments", {
                id: Date.now(),
                name: req.body.name,
                date: movieHelpers.timestampToDate(
                  fullDate[1],
                  fullDate[2],
                  fullDate[3]
                ),
                stars: req.body.stars,
                body: req.body.body
              });
            res.sendStatus(200);
          } else {
            res.sendStatus(500);
          }
        } else {
          res.sendStatus(409);
        }
      }
    )
    .catch((e) => {
      console.error(e.message);
      res.sendStatus(500);
    });
};

export default { PlayMovie, getInfos, receiveReviews, getSubtitles };
