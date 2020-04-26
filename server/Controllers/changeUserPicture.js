import crypto from "crypto";
import UserModel from "../Schemas/User";

const changeUserPicture = async (req, res) => {
  try {
    const hashedPT = `${req.files.image.name.split(".")[0] +
      crypto.randomBytes(5).toString("hex")}.${
      req.files.image.mimetype.split("/")[1]
    }`;
    req.files.image.mv(`./server/data/avatar/${hashedPT}`, (e) => {
      if (e) console.error(e);
    });
    const userInfo = await UserModel.findByIdAndUpdate(
      req.userId,
      { picture: hashedPT },
      {
        runValidators: true
      }
    );
    if (userInfo !== null) res.status(200).send();
    if (userInfo === null) res.status(401).send();
  } catch (e) {
    console.error(e.message);
    res.sendStatus(500);
  }
};

export default changeUserPicture;
