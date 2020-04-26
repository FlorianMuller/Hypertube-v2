import UserModel from "../Schemas/User";

const getUser = async (req, res) => {
  try {
    const userInfos = await UserModel.findById(
      req.userId,
      "email username firstName lastName picture"
    );

    if (userInfos === null) {
      res.sendStatus(400);
    } else {
      res.status(200).send(userInfos);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

export default { getUser };
