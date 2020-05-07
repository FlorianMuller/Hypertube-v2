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
  if (req.params.email === undefined || req.params.lang === undefined)
    return res.send({ status: 401 });
  const user = await UserModel.findOne({ email: req.params.email });
  if (user === null) return res.send({ status: 401 });
  if (user.schoolID !== undefined || user.googleID !== undefined)
    return res.send({ status: 401 });
  const token = await TokenModel.create({
    user: user.id,
    type: "password"
  });
  const emailInfo =
    req.params.lang === "fr" ? resetEmailInfo.fr.html : resetEmailInfo.en.html;
  await sendEmail({
    to: user.email,
    ...resetEmailInfo,
    // Setting unique url in html/text
    html: emailInfo.replace(
      /{{resetUrl}}/g,
      // `${process.env.CLIENT_ORIGIN}/resetPassword/${token}`
      `${process.env.CLIENT_ORIGIN}/new-password/${token.value}`
    ),
    text: emailInfo.replace(
      /{{resetUrl}}/g,
      // `${process.env.CLIENT_ORIGIN}/resetPassword/${token}`
      `${process.env.CLIENT_ORIGIN}/new-password/${token.value}`
    )
  });
  return res.send({ status: 200 });
};

const CheckResetToken = async (resetPasswordToken) => {
  const found = await TokenModel.findOne({ value: resetPasswordToken });
  if (found !== undefined) {
    return true;
  }
  return false;
};

const ResetPassword = async (req, res) => {
  if (req.body.newPassword === null) return res.sendStatus(400);
  if (req.body.newPassword !== req.body.confirmedPassword)
    return res.send({ status: 401 });
  if ((await CheckResetToken(req.body.token)) === false)
    return res.send({ status: 401 });
  const found = await TokenModel.findOne({ value: req.body.token });
  if (found) {
    const newHash = bcrypt.hashSync(req.body.newPassword, 10);
    await UserModel.findByIdAndUpdate(
      { _id: found.user },
      { password: newHash }
    );
    await TokenModel.findOneAndDelete({ value: req.body.token });
    return res.send({ status: 200 });
  }
  return res.send({ status: 401 });
};

export default { SendMail, ResetPassword };
