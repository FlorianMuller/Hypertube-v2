import jwt from "jsonwebtoken";

// todo: reduce this time and implement refresh token
const ACCES_TOKEN_EXPIRATION = 86400; // 24h in secondes

// const accestTokenName = "accesToken";
const accesTokenOption = {
  httpOnly: true
  // todo: add `secure: true` to only send token in https
  // secure: true,
};

export const createAccestToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY, {
    expiresIn: ACCES_TOKEN_EXPIRATION
  });
};

export const setAccesTokenCookie = (res, userId) => {
  const accesToken = createAccestToken(userId);

  res.cookie("accesToken", accesToken, {
    ...accesTokenOption,
    // todo: add `secure: true` to only send token in https
    // secure: true,
    maxAge: ACCES_TOKEN_EXPIRATION * 1000
  });
};
