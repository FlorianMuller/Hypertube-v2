import validEmail, {
  createUser,
  sendValidateEmail,
  validPassword,
  validFile,
  emailIsFree
} from "../Helpers/signUp";
import { setAccesTokenCookie } from "../Helpers/signIn";

import UserModel from "../Schemas/User";
import TokenModel from "../Schemas/Token";

const usernameIsFree = async (username) => {
  try {
    const users = await UserModel.findOne({ username });
    return users === null;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const signUp = async (req, res) => {
  const goodInfos =
    validEmail(req.body.email) &&
    validPassword(req.body.password) &&
    req.files &&
    validFile(req.files.picture);
  const usernameFree = await usernameIsFree(req.body.username);
  const emailFree = await emailIsFree(req.body.email);

  if (goodInfos && usernameFree && emailFree) {
    let userCreated;

    // Creating user in database
    try {
      userCreated = await createUser({
        email: req.body.email,
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        picture: req.files.picture
      });
    } catch (err) {
      console.error(err.message);
      if (err.name === "ValidationError") {
        res
          .status(400)
          .send({ missingInfos: true, nameTaken: false, emailTaken: false });
      } else {
        res.sendStatus(500);
      }
    }

    // Sending confirmation email
    try {
      await sendValidateEmail(userCreated, req.body.locale || "en");
    } catch (err) {
      console.error(err);
    }

    res.status(200).send({ id: userCreated._id });
  } else {
    res.status(400).send({
      missingInfos: !goodInfos,
      nameTaken: !usernameFree,
      emailTaken: !emailFree
    });
  }
};

const resendValidationEmail = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (user && !user.emailVerified) {
      const token = await TokenModel.findOne({ user: user._id });
      // check if 1mn is passed
      if (Date.now() - token.createdAt.getTime() >= 60000) {
        // Deleting old token
        await TokenModel.findOneAndDelete({ user: user._id });
        // Sending a new mail
        await sendValidateEmail(user, req.body.locale || "en");
        res.sendStatus(200);
      } else {
        res.status(400).send({ error: "TOO_SOON" });
      }
    } else {
      res.status(400).send({ error: "WRONG_USER" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "UNKNOWN" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    // Getting data from DB
    const token = await TokenModel.findOne({
      value: req.params.value
    }).populate("user", "emailVerified newEmail");
    if (token) {
      if (!token.user.emailVerified) {
        // Verifying email for the first time
        token.user.emailVerified = true;
        await token.user.save();

        setAccesTokenCookie(res, token.user.id);
      } else if (token.user.newEmail) {
        // Updating email
        await UserModel.findByIdAndUpdate(
          token.user.id,
          { email: token.user.newEmail, newEmail: undefined },
          { runValidators: true }
        );
      }

      // Deleting the token
      await TokenModel.findByIdAndDelete(token._id);

      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

export default { signUp, resendValidationEmail, verifyEmail };
