import bcrypt from "bcrypt";
import UserModel from "../Schemas/User";
import TokenModel from "../Schemas/Token";
import {
  validPassword,
  validEmail,
  emailIsFree,
  getPasswordHash
} from "../Helpers/signUp";
import enHtml from "../emailsHtml/changeEmailAdress.en.html";
import frHtml from "../emailsHtml/changeEmailAdress.fr.html";

import { sendEmail } from "../nodemailer";

const confirmEmailInfo = {
  en: {
    subject: "Confirm your email address change",
    text: `Hi\n\nWe just need to check that your email is really yours\nPlease go to this link to confirm your email adress:\n{{confirmUrl}}`,
    html: enHtml
  },
  fr: {
    subject: "Confirme ton changement d'adresse email",
    text:
      "Salut\n\nOn doit juste vérifier que ton email t'appartient bien\nTu peux aller sur ce lien pour confirmer ton adresse email:\n{{confirmUrl}}",
    html: frHtml
  }
};

const sendValidateEmail = async (user, locale) => {
  const emailInfo = confirmEmailInfo[locale];
  const token = await TokenModel.create({
    user: user._id
  });

  await sendEmail({
    to: user.newEmail,
    ...emailInfo,
    // Setting unique url in html/text
    html: emailInfo.html.replace(
      /{{confirmUrl}}/g,
      `${process.env.CLIENT_ORIGIN}/confirm-email/${token.value}`
    ),
    text: emailInfo.text.replace(
      /{{confirmUrl}}/g,
      `${process.env.CLIENT_ORIGIN}/confirm-email/${token.value}`
    )
  });
};

const editUser = async (req, res) => {
  const errorRes = {};
  const newUser = {};

  try {
    // Password change
    if (req.body.newPassword && req.body.oldPassword) {
      // New password is valid
      if (validPassword(req.body.newPassword)) {
        const userInfos = await UserModel.findById(req.userId);
        if (userInfos) {
          // Current password is valid
          if (await bcrypt.compare(req.body.oldPassword, userInfos.password)) {
            newUser.password = await getPasswordHash(req.body.newPassword);
          } else {
            res.status(401);
            errorRes.password = "Current password not valid";
          }
        } else {
          res.status(404);
          errorRes.password = "User not found";
        }
      } else {
        res.status(400);
        errorRes.password = "New password not valid";
      }
    }

    // Email change
    if (req.body.email) {
      if (validEmail(req.body.email) && emailIsFree(req.body.email)) {
        newUser.newEmail = req.body.email;
      } else {
        res.status(400);
        errorRes.email = "Email not valid or already used";
      }
    }

    // Other
    if (req.body.firstName) newUser.firstName = req.body.firstName;
    if (req.body.lastName) newUser.lastName = req.body.lastName;

    // Updating user
    const userInfo = await UserModel.findByIdAndUpdate(req.userId, newUser, {
      runValidators: true,
      new: true
    });
    if (userInfo) {
      if (newUser.newEmail) {
        sendValidateEmail(userInfo, req.body.locale || "en");
      }
      res.send({ error: errorRes });
    } else {
      res.status(400).send({ error: errorRes });
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

export default editUser;
