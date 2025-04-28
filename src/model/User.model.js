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
    referralCode: {
      type: String,
      unique: true
    },
    referredBy: {
      type: String, // referralCode of the referrer
      default: null
    }
  },
  { timestamps: true }
);
export const User = mongoose.model("User", userSchema);

