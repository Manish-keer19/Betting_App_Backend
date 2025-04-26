import mongoose, { Schema } from "mongoose";
import { Otp } from "./otp.js";
import { Deposit } from "./Diposit.model.js";
import { BankDetail } from "./bank_detail.model.js";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String, // hash this in production
    balance: { type: Number, default: 0 },
    profilePic: String,
    DepositHistory: {
      type: Schema.Types.ObjectId,
      ref: "Deposit",
    },
    Role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    BankDetails: {
      type: Schema.Types.ObjectId,
      ref: "BankDetail",
    },
  },
  { timestamps: true }
);
export const User = mongoose.model("User", userSchema);






// import mongoose, { Schema, Document, Types } from "mongoose";
// import { Deposit } from "./Diposit.model";
// import { BankDetail } from "./bank_detail.model";

// // Step 1: Define the interface
// export interface IUser extends Document {
//   username?: string;
//   email?: string;
//   password?: string;
//   balance: number;
//   profilePic?: string;
//   DepositHistory?: Types.ObjectId | typeof Deposit;
//   Role: "ADMIN" | "USER";
//   BankDetails?: Types.ObjectId | typeof BankDetail;
// }

// // Step 2: Define schema
// const userSchema = new Schema<IUser>(
//   {
//     username: String,
//     email: String,
//     password: String,
//     balance: { type: Number, default: 0 },
//     profilePic: String,
//     DepositHistory: {
//       type: Schema.Types.ObjectId,
//       ref: "Deposit",
//     },
//     Role: {
//       type: String,
//       enum: ["ADMIN", "USER"],
//       default: "USER",
//     },
//     BankDetails: {
//       type: Schema.Types.ObjectId,
//       ref: "BankDetail",
//     },
//   },
//   { timestamps: true }
// );

// // Step 3: Export the typed model
// export const User = mongoose.model<IUser>("User", userSchema);
