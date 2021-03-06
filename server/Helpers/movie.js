import torrentStream from "torrent-stream";
import fs from "fs";

import ioConnection from "..";
import MovieCommentModel from "../Schemas/MovieComment";
import UserHistoryModel from "../Schemas/UserHistory";

const timestampToDate = (month, day, year) => {
  return `${month}, ${day}, ${year}`;
};

const findReviews = async (movieId) => {
  try {
    const reviews = await MovieCommentModel.find({ movieId });
    const ourReviews = { movieRating: 0, review: [] };
    if (reviews.length > 0) {
      reviews.forEach(({ _id, authorUsername, date, stars, body }) => {
        ourReviews.review.push({ id: _id, authorUsername, date, stars, body });
      });
    }
    return ourReviews;
  } catch (e) {
    console.error(e.message);
    return e.message;
  }
};

const logHistory = async (history) => {
  try {
    const userHistory = await UserHistoryModel.find({
      movieName: history.movieName,
      userId: history.userId
    });
    if (userHistory.length > 0) {
      await UserHistoryModel.findOneAndUpdate(
        {
          movieName: history.movieName,
          userId: history.userId
        },
        { ...history, _id: userHistory[0]._id },
        { useFindAndModify: false }
      );
    } else {
      await UserHistoryModel.create({
        _id: history._id,
        userId: history.userId,
        movieId: history.movieId,
        movieName: history.movieName,
        date: history.date
      });
    }
    return true;
  } catch (e) {
    console.error(e.message);
    return e.message;
  }
};

const downloadVideo = (movieId, magnet) => {
  // console.log(magnet);
  const engine = torrentStream(`${magnet}`, {
    path: "./server/data/movie/",
    trackers: [
      "udp%3A%2F%2Fzer0day.ch%3A1337",
      "udp%3A%2F%2Fopen.demonii.com%3A1337",
      "udp%3A%2F%2Fexodus.desync.com%3A6969",
      "udp://open.demonii.com:1337/announce",
      "udp://tracker.openbittorrent.com:80",
      "udp://tracker.coppersurfer.tk:6969",
      "udp://glotorrents.pw:6969/announce",
      "udp://tracker.opentrackr.org:1337/announce",
      "udp://torrent.gresille.org:80/announce",
      "udp://p4p.arenabg.com:1337",
      "udp://tracker.leechers-paradise.org:6969"
    ]
  });
  engine.on("ready", () => {
    // setInterval(() => console.log(engine.swarm.wires.length), 1000);
  });
  let currentIndex = 0;
  engine.on("idle", () => {
    const torrent = engine.files.find(({ name }) => {
      return (
        name.split(".")[name.split(".").length - 1] === "mp4" ||
        name.split(".")[name.split(".").length - 1] === "webm"
      );
    });
    if (currentIndex === 50) {
      return;
    }
    const filePiece = torrent.length / 50;
    // console.log(torrent, torrent.path);
    console.log("Creating new piece ", currentIndex);
    fs.exists(`./server/data/movie/${torrent.path}`, (exists) => {
      if (exists) {
        ioConnection.ioConnection
          .to(movieId)
          .emit(
            "Video source",
            `http://localhost:8080/api/movie/streaming/${torrent.path}`
          );
      } else {
        torrent.createReadStream({
          start: filePiece * currentIndex,
          end: filePiece * (currentIndex + 1)
        });
        if (currentIndex > 0) {
          ioConnection.ioConnection
            .to(movieId)
            .emit(
              "Video source",
              `http://localhost:8080/api/movie/streaming/${torrent.path}`
            );
        }
        currentIndex++;
      }
    });
  });
};

const saveReview = async (comment) => {
  try {
    return await MovieCommentModel.create({
      _id: comment._id || undefined,
      movieId: comment.movieId,
      movieName: comment.movieName,
      authorUsername: comment.authorUsername,
      date: comment.date,
      stars: comment.stars,
      body: comment.body
    });
  } catch (e) {
    console.error(e.message);
    return e.message;
  }
};

export default {
  timestampToDate,
  findReviews,
  logHistory,
  downloadVideo,
  saveReview
};
