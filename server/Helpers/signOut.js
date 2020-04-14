import { accestTokenName, accesTokenOption } from "./signIn";

const deleteAccessTokenCookie = (res) => {
  res.clearCookie(accestTokenName, accesTokenOption);
};

export default deleteAccessTokenCookie;
