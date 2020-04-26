import bcrypt from "bcrypt";
import UserModel from "../Schemas/User";
import TokenModel from "../Schemas/Token";
import { validPassword, validEmail, emailIsFree } from "../Helpers/signUp";
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
  if (req.body.newPassword && req.body.oldPassword) {
    const hash = await bcrypt.hash(req.body.newPassword, 10);
    if (!validPassword(req.body.newPassword)) {
      res.status(400).send();
    } else {
      try {
        const userInfos = await UserModel.findById(req.userId);
        if (userInfos === null) {
          res.status(404).send();
        } else if (
          !(await bcrypt.compare(req.body.oldPassword, userInfos.password))
        ) {
          res.status(401).send();
        } else {
          const userInfo = await UserModel.findByIdAndUpdate(
            req.userId,
            { password: hash },
            {
              runValidators: true
            }
          );
          if (userInfo !== null) res.status(200).send();
          if (userInfo === null) res.status(500).send();
        }
      } catch (e) {
        res.sendStatus(500);
      }
    }
  } else if (req.body.email) {
    if (emailIsFree(req.body.email && validEmail)) {
      try {
        const newEmail = req.body.email;
        const userInfo = await UserModel.findByIdAndUpdate(req.userId, {
          newEmail
        });
        if (userInfo !== null) {
          sendValidateEmail(userInfo, "fr");
          res.status(200).send();
        }
        if (userInfo === null) res.status(400).send();
      } catch (e) {
        res.sendStatus(500);
      }
    } else res.sendStatus(500);
  } else if (
    !req.body.password &&
    !req.body.picture &&
    !req.body.emailVerified &&
    !req.body.newEmail
  ) {
    try {
      const userInfo = await UserModel.findByIdAndUpdate(req.userId, req.body, {
        runValidators: true
      });
      if (userInfo !== null) res.sendStatus(200);
      if (userInfo === null) res.sendStatus(400);
    } catch (e) {
      res.sendStatus(500);
    }
  }
};

export default editUser;
