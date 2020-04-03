import { deleteAccessTokenCookie } from "../Helpers/signIn";

const logOut = async (_req, res) => {
  try {
    deleteAccessTokenCookie(res);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
};

export default logOut;
