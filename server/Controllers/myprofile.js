import UserModel from "../Schemas/User";

const getUser = async (req, res) => {
  try {
    const userInfos = await UserModel.findById(
      req.userId,
      "email username firstName lastName picture googleID schoolID"
    );

    if (userInfos === null) {
      res.sendStatus(400);
    } else {
      // adding `isOnmiAuth` virtual and removing `googleID` and `schoolID` (used to calculate isOnmiAuth)
      res.send({
        ...userInfos.toJSON({ virtuals: true }),
        picture: userInfos.isOnmiAuth
          ? userInfos.picture
          : `${process.env.CLIENT_ORIGIN}/api/avatar/${userInfos.picture}`,
        googleID: undefined,
        schoolID: undefined
      });
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

export default { getUser };
