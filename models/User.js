import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "superAdmin", "registrar", "accountant", "programHeads"],
    required: true,
  },
  isActive: { type: Boolean },
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
