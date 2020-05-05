import Axios from "axios";
import mime from "mime";
import TorrentStream from "torrent-stream";
import pump from "pump";
import fs from "fs";
import OS from "opensubtitles-api";
import download from "download";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import movieHelpers from "../Helpers/movie";
import { searchMoviesOnYts } from "../Helpers/search";
import mongoose from "../mongo";
// import ioConnection from "..";

import MovieModel from "../Schemas/MoviesDatabase";
import MovieCommentModel from "../Schemas/MovieComment";
// import UserModel from "../Schemas/User";
import UserHistoryModel from "../Schemas/UserHistory";
import Io from "../Helpers/socket";

ffmpeg.setFfmpegPath(ffmpegPath);

const Movie = mongoose.model("Movie", MovieModel);

const OpenSubtitles = new OS({
  useragent: "noelledeur",
  username: "noelledeur",
  password: "Hypertube1234",
  ssl: true
});

const TMDBURL = "https://api.themoviedb.org/3/movie/";
const TMDBKEY = "b0d86f66b9c1cc3286e862e306745391";
const TMDB_API_KEY_V3 = "83c2bcadbf1d325b41d0bb1253079038";
const TMDBPOSTERURL = "http://image.tmdb.org/t/p/w300//";

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
    "http://tracker.electro-torrent.pl:80/announce",
    " udp://151.80.120.114:2710/announce",
    "udp://182.176.139.129:6969/announce",
    "udp://5.79.249.77:6969/announce",
    "udp://5.79.83.193:6969/announce",
    "udp://62.138.0.158:6969/announce",
    "udp://9.rarbg.com:2710/announce",
    "udp://9.rarbg.com:2750/announce",
    "udp://9.rarbg.com:2770/announce",
    "udp://9.rarbg.com:2780/announce",
    "udp://9.rarbg.me:2710/announce",
    "udp://9.rarbg.me:2730/announce",
    "udp://9.rarbg.me:2750/announce",
    "udp://9.rarbg.me:2780/announce",
    "udp://9.rarbg.to:2710/announce",
    "udp://9.rarbg.to:2730/announce",
    "udp://9.rarbg.to:2740/announce",
    "udp://9.rarbg.to:2790/announce",
    "udp://91.218.230.81:6969/announce",
    "udp://bt.xxx-tracker.com:2710/announce",
    "udp://eddie4.nl:6969/announce",
    "udp://exodus.desync.com:6969",
    "udp://inferno.demonoid.ph:3389/announce",
    "udp://inferno.demonoid.pw:3391/announce",
    "udp://inferno.demonoid.pw:3418/announce",
    "udp://ipv4.tracker.harry.lu:80/announce",
    "udp://mgtracker.org:2710/announce",
    "udp://mgtracker.org:6969/announce",
    "udp://open.stealth.si:80/announce",
    "udp://opentrackr.org:1337/announce",
    "udp://p4p.arenabg.ch:1337",
    "udp://p4p.arenabg.ch:1337/announce",
    "udp://p4p.arenabg.com:1337",
    "udp://p4p.arenabg.com:1337/announce",
    "udp://pubt.in:2710/announce",
    "udp://retracker.coltel.ru:2710/announce",
    "udp://sandrotorde.de:1337/announce",
    "udp://shadowshq.eddie4.nl:6969/announce",
    "udp://shadowshq.yi.org:6969/announce",
    "udp://thetracker.org:80",
    "udp://thetracker.org:80/announce",
    "udp://tracker.christianbro.pw:6969/announce",
    "udp://tracker.coppersurfer.tk:6969",
    "udp://tracker.coppersurfer.tk:6969/announce",
    "udp://tracker.coppersurfer.tk:80",
    "udp://tracker.coppersurfer.tk:80/announce",
    "udp://tracker.cypherpunks.ru:6969/announce",
    "udp://tracker.eddie4.nl:6969/announce",
    "udp://tracker.internetwarriors.net:1337/announce",
    "udp://tracker.justseed.it:1337/announce",
    "udp://tracker.leechers-paradise.org:6969",
    "udp://tracker.leechers-paradise.org:6969/announce",
    "udp://tracker.mg64.net:2710/announce",
    "udp://tracker.mg64.net:6969/announce",
    "udp://tracker.mgtracker.org:2710/announce",
    "udp://tracker.open-internet.nl:6969/announce",
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://tracker.pirateparty.gr:6969/announce",
    "udp://tracker.tiny-vps.com:6969/announce",
    "udp://tracker.torrent.eu.org:451",
    "udp://tracker.torrent.eu.org:451/announce",
    "udp://tracker.vanitycore.co:6969/announce",
    "udp://www.eddie4.nl:6969/announce",
    "udp://zephir.monocul.us:6969/announce"
  ]
};

const miniDownload = 1;

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
    `https://yts.ae/api/v2/list_movies.json?query_term=${req.params.imdbId}`
  );
  let sourceUrl;
  let sourceSite;
  let actors = [];
  const castingUrl = `https://api.themoviedb.org/3/movie/${req.params.imdbId}/credits?api_key=${TMDB_API_KEY_V3}`;
  if (
    response.data.data.movie_count &&
    response.data.data.movies[0].imdb_code === req.params.imdbId
  ) {
    sourceUrl = `https://yts.ae/api/v2/movie_details.json?movie_id=${response.data.data.movies[0].id}`;
    sourceSite = "yts";
  } else {
    sourceUrl = `${TMDBURL}${req.params.imdbId}?api_key=${TMDBKEY}&language=${req.params.language}`;
    sourceSite = "tmdb";
  }
  let reviews;
  let infos;

  await Axios.get(castingUrl).then(async (castingRes) => {
    const { cast } = castingRes.data;

    const fivecast = cast.slice(0, 5);

    actors = fivecast.map((el) => el.name);
  });

  await Axios.get(sourceUrl)
    .then(async (movieRes) => {
      let movie;
      if (sourceSite === "yts") movie = movieRes.data.data.movie;
      else movie = movieRes.data;
      infos = {
        title: movie.title,
        description:
          sourceSite === "yts" ? movie.description_full : movie.overview,
        prodDate:
          sourceSite === "yts" ? movie.year : movie.release_date.split("_")[0],
        runTime: movie.runtime,
        imdbRating:
          sourceSite === "yts" ? movie.rating / 2 : movie.vote_average / 2,
        poster:
          sourceSite === "yts"
            ? `https://yts.ae${movie.medium_cover_image}`
            : `${TMDBPOSTERURL}${movie.poster_path}`,
        imdbid: sourceSite === "yts" ? movie.imdb_code : movie.imdb_id,
        casting: actors
      };
      try {
        UserHistoryModel.create({
          userId: req.userId,
          movieId: req.params.imdbId,
          movieName: infos.title,
          date: Date()
        });
      } catch (e) {
        console.error(e);
      }
      reviews = await movieHelpers.findReviews(req.params.imdbId);
      res.status(200).send({ infos, reviews });
    })
    .catch((e) => {
      console.error(e.message);
      res.sendStatus(500);
    });
  return undefined;
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
  const ArrayMagnet = [];
  if (sourceSite !== "yts") {
    movie.map((el) => {
      const [magnetTmp] = el.download.split("&");
      ArrayMagnet.push(magnetTmp);
      return undefined;
    });
  }
  let magnet;
  if (sourceSite === "yts")
    magnet = `magnet:?xt=urn:btih:${movie.torrents[0].hash}`;
  else {
    ArrayMagnet.map((el) => {
      magnet = el;
      return undefined;
    });
  }

  const engine = TorrentStream(magnet, options);

  let newFilePath;
  let fileSize;
  let isDownloading = false;
  // let downloadingInProgress = false;
  setTimeout(() => {
    if (!isDownloading) Io.socket.to(movieId).emit("movie-not-ref");
    return undefined;
  }, 120000);
  engine
    .on("ready", () => {
      isDownloading = true;
      // setTimeout(() => {
      //   if (!downloadingInProgress) Io.socket.to(movieId).emit("movie-not-ref");
      //   return undefined;
      // }, 120000);
      console.log("Begin download");
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

            const isGoodFormat =
              mime.getType(file.name) === "video/mp4" ||
              mime.getType(file.name) === "video/ogg";
            const head = {
              "Content-Range": `bytes ${start}-${end}/${fileSize}`,
              "Accept-Ranges": "bytes",
              "Content-Length": chunksize,
              "Content-Type": isGoodFormat
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
            const isGoodFormat =
              mime.getType(file.name) === "video/mp4" ||
              mime.getType(file.name) === "video/ogg";

            const head = {
              "Content-Length": fileSize,
              "Content-Type": isGoodFormat
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
  const token = await Axios.get(
    "https://torrentapi.org/pubapi_v2.php?get_token=get_token&app_id=Hypertube1"
  );
  const response = await Axios(
    `https://yts.ae/api/v2/list_movies.json?query_term=${req.params.imdbId}`
  );
  let sourceUrl;
  let sourceSite;
  if (
    response.data.data.movie_count &&
    response.data.data.movies[0].imdb_code === req.params.imdbId
  ) {
    sourceUrl = `https://yts.ae/api/v2/movie_details.json?movie_id=${response.data.data.movies[0].id}`;
    sourceSite = "yts";
  } else {
    sourceUrl = `https://torrentapi.org/pubapi_v2.php?token=${token.data.token}&app_id=Hypertube1&mode=search&category=movies&format=json_extended&limit=100&search_imdb=${movieId}`;
    sourceSite = "TorrentApi";
  }
  setTimeout(() => {
    Axios.get(sourceUrl)
      .then(async (movieRes) => {
        if (movieRes.data.error) return res.status(500).send("Ressource error");
        const movie =
          sourceSite === "yts"
            ? movieRes.data.data.movie
            : movieRes.data.torrent_results;

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
              const [pathFile, pathRepo] = movieFound.path.split("/").reverse();
              pathMovie = `${process.cwd()}/server/data/movie/${pathRepo}/${pathFile}`;
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
        return undefined;
      })
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }, 5000);
};

const receiveReviews = (req, res) => {
  const comment = req.body;
  try {
    MovieCommentModel.create({
      movieId: comment.movieId,
      movieName: comment.movieName,
      name: comment.name,
      date: Date.now(),
      stars: comment.stars,
      body: comment.body
    });
    res.status(200).send("OK");
  } catch (e) {
    console.log(e);
    res.status(500);
  }
};

const getRecommendation = async (_req, res) => {
  try {
    // Get most downloaded movies of the current year (or year before in january)
    const { movies } = await searchMoviesOnYts({
      year: new Date().getFullYear() - (new Date().getMonth > 0 ? 0 : 1)
    });

    // Shuffle array
    movies.sort(() => 0.5 - Math.random());

    // Sending sub-array of the first 4 elements after shuffle
    res.send({ list: movies.slice(0, 4) });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

const getReviews = async (req, res) => {
  const newReviews = await movieHelpers.findReviews(req.params.id);
  res.status(200).send(newReviews);
};

export default {
  PlayMovie,
  getInfos,
  receiveReviews,
  getSubtitles,
  getRecommendation,
  getReviews
};
