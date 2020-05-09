import UserModel from "../Schemas/User";
import { validFile, savePicture } from "../Helpers/signUp";

const changeUserPicture = async (req, res) => {
  if (req.files && req.files.image && validFile(req.files.image)) {
    try {
      const hashedPT = savePicture(req.files.image);

      const userInfo = await UserModel.findByIdAndUpdate(
        req.userId,
        { picture: hashedPT },
        {
          runValidators: true,
          new: true
        }
      );

      if (userInfo !== null) {
        res.send({
          newPath: `${process.env.CLIENT_ORIGIN}/api/avatar/${userInfo.picture}`
        });
      } else {
        res.sendStatus(401);
      }
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }
};

export default changeUserPicture;
