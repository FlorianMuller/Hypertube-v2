import bcrypt from "bcrypt";
import UserModel from "../Schemas/User";
import TokenModel from "../Schemas/Token";
import { sendEmail } from "../nodemailer";
import enHtml from "../emailsHtml/resetPassword.en.html";
import frHtml from "../emailsHtml/resetPassword.fr.html";

const resetEmailInfo = {
  en: {
    subject: "Hypertube: Reset password",
    text: `To reset your password clic on the link:\n{{resetUrl}}`,
    html: enHtml
  },
  fr: {
    subject: "Hypertube: Réinitialiser votre mot de passe",
    text:
      "Pour réinitialiser votre mot de passe cliquez sur le lien:\n{{resetUrl}}",
    html: frHtml
  }
};

const SendMail = async (req, res) => {
  if (req.body.email === undefined || req.body.lang === undefined)
    return res.sendStatut(401);
  const user = await UserModel.findOne({ email: req.body.email });
  if (user === null) return res.sendStatut(401);
  console.log(user);
  if (user.schoolID !== undefined || user.googleID !== undefined)
    return res.sendStatus(401);
  const token = await TokenModel.create({
    user: user.id,
    type: "password"
  });
  const emailInfo =
    req.body.lang === "fr" ? resetEmailInfo.fr.html : resetEmailInfo.en.html;
  await sendEmail({
    to: user.email,
    ...resetEmailInfo,
    // Setting unique url in html/text
    html: emailInfo.replace(
      /{{resetUrl}}/g,
      `${process.env.CLIENT_ORIGIN}/resetPassword/${token}`
    ),
    text: emailInfo.replace(
      /{{resetUrl}}/g,
      `${process.env.CLIENT_ORIGIN}/resetPassword/${token}`
    )
  });
  return res.status(200).send("OK");
};

const CheckResetToken = async (resetPasswordToken) => {
  const found = await TokenModel.findOne({ value: resetPasswordToken });
  if (found !== undefined) {
    return true;
  }
  return false;
};

const ResetPassword = async (req, res) => {
  if (req.body.password === null) return res.sendStatus(400);
  if (req.body.password !== req.body.repeatPassword) return res.sendStatus(400);
  if ((await CheckResetToken(req.body.token)) === false)
    return res.redirect("/");
  const found = await TokenModel.findOne({ value: req.body.token });
  console.log(found);
  const newPassword = bcrypt.hashSync(req.body.password, 10);
  await UserModel.findByIdAndUpdate(
    { _id: found.user },
    { password: newPassword }
  );
  await TokenModel.findOneAndDelete({ value: req.body.token });
  return res.redirect("/");
};

export default { SendMail, ResetPassword };
