import {
  deleteAccessTokenCookie,
  deleteLoggedCookie
} from "../Helpers/signOut";

const signOutController = async (_req, res) => {
  try {
    deleteAccessTokenCookie(res);
    deleteLoggedCookie(res);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

export default signOutController;
