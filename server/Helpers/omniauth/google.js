import passport from "passport";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import UserModel from "../../Schemas/User";

const userExist = async (googleId) => {
  try {
    const user = await UserModel.findOne({ googleID: googleId });
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

const logUser = async (googleID) => {
  try {
    const userFound = await UserModel.findOne({ googleID });
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
      googleID: profile.id,
      email: profile.emails[0].value,
      username: profile.displayName,
      firstName: profile.name.familyName,
      lastName: profile.name.givenName,
      picture: profile.photos[0].value,
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
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.CLIENT_ORIGIN}/api/user/google/callback`
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const exist = await userExist(profile.id);
      if (exist.error) done(null, { error: exist.error });
      if (exist) {
        done(null, await logUser(profile.id));
      } else {
        await createAccount(profile);
        done(null, await logUser(profile.id));
      }
    }
  )
);

export default passport;
