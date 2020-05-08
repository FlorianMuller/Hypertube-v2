import passport from "passport";
import { Strategy as SchoolStrategy } from "passport-oauth2";
import Axios from "axios";
import UserModel from "../../Schemas/User";

const userExist = async (schoolID) => {
  try {
    const user = await UserModel.findOne({ schoolID });
    if (user === null || user === undefined) return false;
    return true;
  } catch (err) {
    return {
      error: {
        status: 500,
        message: err.message
      }
    };
  }
};

const logUser = async (schoolID) => {
  try {
    const userFound = await UserModel.findOne({ schoolID });
    if (userFound === null || userFound === undefined)
      return {
        error: {
          status: 500,
          message: "Unauthorized"
        }
      };
    return { id: userFound._id };
  } catch (err) {
    return {
      error: {
        status: 500,
        message: err.message
      }
    };
  }
};

const createAccount = async (profile) => {
  try {
    await UserModel.create({
      schoolID: profile.id,
      email: profile.email,
      username: profile.login,
      firstName: profile.first_name,
      lastName: profile.last_name,
      picture: profile.image_url,
      emailVerified: true
    });
    return true;
  } catch (err) {
    return {
      error: {
        status: 500,
        message: err.message
      }
    };
  }
};

passport.use(
  new SchoolStrategy(
    {
      authorizationURL: process.env.SCHOOL_URL_AUTH,
      tokenURL: process.env.SCHOOL_TOKEN_API,
      clientID: process.env.SCHOOL_CLIENT_ID,
      clientSecret: process.env.SCHOOL_CLIENT_SECRET,
      callbackURL: `${process.env.CLIENT_ORIGIN}/api/user/42/callback`
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const user = await Axios("https://api.intra.42.fr/v2/me", {
        headers: {
          Authorization: `Bearer ${_accessToken}`
        }
      });
      const exist = await userExist(user.data.id);
      if (exist.error) done(null, { error: exist.error });
      if (exist) {
        done(null, await logUser(user.data.id));
      } else {
        await createAccount(user.data);
        done(null, await logUser(user.data.id));
      }
    }
  )
);

export default passport;
