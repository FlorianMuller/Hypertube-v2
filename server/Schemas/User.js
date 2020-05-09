import mongoose from "../mongo";

const userSchema = new mongoose.Schema({
  googleID: { type: String, unique: true },
  schoolID: { type: String, unique: true },
  email: { type: String, maxlength: 100, required: true, unique: true },
  newEmail: { type: String, maxlength: 100, required: false, unique: true },
  username: { type: String, maxlength: 30, required: true, unique: true },
  firstName: { type: String, maxlength: 30, required: true },
  lastName: { type: String, maxlength: 30, required: true },
  password: { type: String, maxlength: 1028 },
  picture: { type: String, required: true },
  emailVerified: { type: Boolean, default: false }
});

// disable: to use this in the function
// eslint-disable-next-line func-names
userSchema.virtual("isOnmiAuth").get(function() {
  return !!(this.googleID || this.schoolID);
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
