import crypto from "crypto";
import bcrypt from "bcrypt";
import fileType from "file-type";

import UserModel from "../Schemas/User";
import TokenModel from "../Schemas/Token";

import { sendEmail } from "../nodemailer";
import enHtml from "../emailsHtml/confirmEmailAdress.en.html";
import frHtml from "../emailsHtml/confirmEmailAdress.fr.html";

const confirmEmailInfo = {
  en: {
    subject: "Confirm your email adress to watch some sick movies",
    text: `Welcome to Hypertube\n\nWe just need to check that your email is really yours\nPlease go to this link to confirm your email adress:\n{{confirmUrl}}`,
    html: enHtml
  },
  fr: {
    subject: "Confirme ton adresse email pour regarder des films stylés",
    text:
      "Bienvenue sur Hypertube\n\nOn doit juste vérifier que ton email t'appartient bien\nTu peux aller sur ce lien pour confirmer ton adresse email:\n{{confirmUrl}}",
    html: frHtml
  }
};

export const emailIsFree = async (email) => {
  try {
    const users = await UserModel.findOne({ email });
    return users === null;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const validEmail = (email) => {
  const regex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  return email && regex.test(String(email));
};

export const validPassword = (password) => {
  const regex = /(?=^.{8,}$)((?!.*\s)(?=.*[A-Z])(?=.*[a-z]))((?=(.*\d){1,})|(?=(.*\W){1,}))^.*$/;
  return password && regex.test(password);
};

export const sendValidateEmail = async (user, locale) => {
  const emailInfo = confirmEmailInfo[locale];
  const token = await TokenModel.create({
    user: user._id,
    type: "emailSignUp"
  });

  await sendEmail({
    to: user.email,
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

export const validFile = (file) => {
  const { name, size, data, mimetype: type } = file;
  const ab = new Uint8Array(data);
  const fileRes = fileType(ab);
  if (!name || !fileRes) {
    return false;
  }
  if (
    !type ||
    (type !== "image/png" && type !== "image/jpeg" && type !== "image/jpg") ||
    (fileRes.ext !== "png" && fileRes.ext !== "jpeg" && fileRes.ext !== "jpg")
  ) {
    return false;
  }
  if (!size || size > 1000000) {
    return false;
  }
  return true;
};

export const savePicture = (picture) => {
  const hashedPT = `${picture.name.split(".")[0] +
    crypto.randomBytes(5).toString("hex")}.${picture.mimetype.split("/")[1]}`;

  picture.mv(`./server/data/avatar/${hashedPT}`, (e) => {
    if (e) console.error(e);
  });

  return hashedPT;
};

export const getPasswordHash = async (password) => bcrypt.hash(password, 10);

export const createUser = async (user, dontInsertPicture) => {
  let hashedPT;
  if (!dontInsertPicture) {
    hashedPT = savePicture(user.picture);
  } else {
    hashedPT = user.picture;
  }
  const hashedPW = await getPasswordHash(user.password);
  return UserModel.create({
    ...user,
    password: hashedPW,
    picture: hashedPT
  });
};
