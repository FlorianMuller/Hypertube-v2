import deleteAccessTokenCookie from "../Helpers/signOut";

const singOutController = async (_req, res) => {
  try {
    deleteAccessTokenCookie(res);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
};

export default singOutController;
