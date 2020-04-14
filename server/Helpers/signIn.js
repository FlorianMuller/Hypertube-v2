import jwt from "jsonwebtoken";

// todo: reduce this time and implement refresh token
const ACCES_TOKEN_EXPIRATION = 86400; // 24h in secondes

export const accestTokenName = "accesToken";
export const accesTokenOption = {
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

  res.cookie(accestTokenName, accesToken, {
    ...accesTokenOption,
    maxAge: ACCES_TOKEN_EXPIRATION * 1000
  });
};
