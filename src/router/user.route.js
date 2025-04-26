import { Router } from "express";
import { authentication } from "../middleware/authantication.js";
import {
  DipositMoney,
  getUserBalance,
  getUserBankDetails,
  getUserDeposits,
  getUserWithdrawHistory,
  SaveUserBankDetails,
  withdrawMoney,
} from "../controller/User.controller.js";

const userRoute = Router();

userRoute.post("/deposit-money", authentication, DipositMoney);
userRoute.get("/get-user-deposits/:userId", authentication, getUserDeposits);
userRoute.get("/get-user-balance",authentication, authentication,getUserBalance)
userRoute.get(
  "/get-user-withdraw-history/:userId",
  authentication,
  getUserWithdrawHistory
);
userRoute.post("/save-user-Bank-Details", authentication, SaveUserBankDetails);
userRoute.post(
  "/create-withdraw-request",
  authentication,
   withdrawMoney
);
userRoute.get(
  "/getUserBankDetails/:userId",
  authentication,
  getUserBankDetails
);
export default userRoute;
