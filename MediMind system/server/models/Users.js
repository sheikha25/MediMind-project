import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  name:{ type: String, required: true},
  email:{ type: String, required: true, unique: true},
  phoneNumber:{ type: String, required: true},
  password:{ type: String, required: true},
  role:{ type: String, required: true},
 medicalCondition:{ type: [String]},
  profilepic:{ type: String },
});

const UserModel = mongoose.model("UsersTbl", UserSchema, "UsersTbl");
export default UserModel;