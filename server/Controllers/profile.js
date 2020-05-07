import UserModel from "../Schemas/User";
import MovieCommentModel from "../Schemas/MovieComment";

const getMovieCommentsByUsername = async (req, res) => {
  const authorUsername = req.params.username;
  try {
    const userComments = await MovieCommentModel.find({ authorUsername });

    if (userComments.length === 0) {
      res.status(204).send();
    } else {
      res.status(200).send(userComments);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const userInfos = await UserModel.findOne(
      { username },
      "username firstName lastName picture"
    );
    if (userInfos === null) {
      res.sendStatus(404);
    }
    res.status(200).send(userInfos);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

export default { getUserByUsername, getMovieCommentsByUsername };
