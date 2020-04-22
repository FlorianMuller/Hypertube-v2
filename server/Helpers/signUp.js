import bcrypt from "bcrypt";

import UserModel from "../Schemas/User";

const createRandomId = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const sendEmail = async () => true;

const createUser = async (user, insertPT) => {
  try {
    let hashedPT;
    if (insertPT) {
      hashedPT = `${user.picture.name.split(".")[0] + createRandomId(5)}.${
        user.picture.mimetype.split("/")[1]
      }`;
      user.picture.mv(`./server/data/avatar/${hashedPT}`, (e) => {
        if (e) console.error(e);
      });
    } else {
      hashedPT = user.picture;
    }
    const hashedPW = await bcrypt.hash(user.password, 10);
    await UserModel.create({
      _id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      password: hashedPW,
      picture: hashedPT
    });
    return true;
  } catch (e) {
    console.error(e.message);
    return e.name;
  }
};

export default { sendEmail, createUser };
