const accestTokenName = "accesToken";
const accesTokenOption = {
  httpOnly: true
  // todo: add `secure: true` to only send token in https
  // secure: true,
};

const deleteAccessTokenCookie = (res) => {
  res.clearCookie(accestTokenName, accesTokenOption);
};

export default deleteAccessTokenCookie;
