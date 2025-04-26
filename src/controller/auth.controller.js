import { User } from "../model/User.model.js";

import optgenerator from "otp-generator";
import { Otp } from "../model/otp.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// generate otp
export const generateOtp = async (
  req,
  res
) => {
  try {
    const { email } = req.body;
    console.log("email is ", email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Generate OTP
    const otp = optgenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    console.log("otp is ", otp);

    // Check if an OTP exists for the email
    const existingOtp = await Otp.findOne({ email: email });

    if (existingOtp) {
      // Update existing OTP
      existingOtp.otp = otp;
      await existingOtp.save(); // Save the updated OTP
      console.log("Updated OTP for existing user");
    } else {
      // Save new OTP to database
      await Otp.create({ email: email, otp: otp });
      console.log("Created new OTP for user");
    }

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      otp, // Optionally return the generated OTP
    });
  } catch (error) {
    console.log("error while generating OTP", error); // Added error logging
    return res.status(500).json({
      success: false,
      message: "Something went wrong while generating OTP",
    });
  }
};

export const Signup = async (req, res) => {
  try {
    console.log("req.body is ", req.body);
    const { username, email, password, otp,role } = req.body;
    console.log("username is ", username);
    console.log("email is ", email);
    console.log("password is ", password);
    // console.log("otp is ", otp);

    if (!username || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

   

    const IsUser = await User.findOne({ email: email });

    if (IsUser) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    const dbotp = await Otp.findOne({ email: email });
    console.log("dbotp is ", dbotp);

    if (dbotp?.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
      profilePic: `https://res.cloudinary.com/degag862k/image/upload/v1744893491/WhatsApp_Image_2025-04-17_at_09.07.23_19048e01_fk6hmm.jpg`,
      Role:"USER"
      // profilePic: `https://ui-avatars.com/api/?name=${username}+${username}&background=random&color=000`,
    });

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    console.log("error is ", error);
    return res.status(500).json({
      success: false,
      message: "could not signup the user",
    });
  }
};

export const Login = async (req, res) => {
  console.log("req.body is ", req.body);
  try {
    const { email, password } = req.body;
    console.log("email is ", email);
    console.log("password is ", password);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const isUserExist = await User.findOne({ email: email }, {}, { new: true });

    console.log("isuserExitst is ", isUserExist);
    if (!isUserExist) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      isUserExist.password || ""
    );
    if (!isPasswordMatch) {
      console.log("Password does not match");
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const payload = {
      id: isUserExist._id,
      email: isUserExist.email,
      Role: isUserExist.Role,
    };

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT secret is not defined",
      });
    }

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d",
    });
    const JWT_SECRET_REFRESH = process.env.JWT_SECRET;
    if (!JWT_SECRET_REFRESH) {
      return res.status(500).json({
        success: false,
        message: "JWT secret is not defined",
      });
    }

    // // Generate refresh token (long-lived, e.g., 7 days)
    // const refreshToken = jwt.sign(payload, JWT_SECRET_REFRESH, {
    //   expiresIn: "7d",
    // });

    // // Set refresh token as a cookie
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: true, // Set to true for HTTPS, false for HTTP
    //   sameSite: "strict", // Adjust based on your requirements
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    // });

    const user = {
      ...isUserExist.toObject(),
      token: token,
    };
    user.password = "";

    console.log("user is ", user);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: user,
      token,
    });
  } catch (error) {
    console.log("could not login the user", error);
    return res.status(500).json({
      success: false,
      message: "could not login the user",
    });
  }
};

// export const sendOtp = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { email } = req.body;
//     console.log("email is ", email);

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     // check if user user exists or not
//     const isUserExist = await User.findOne({ email: email });
//     if (!isUserExist) {
//       return res.status(400).json({
//         success: false,
//         message: "User not found",
//       });
//     }
//     // Generate OTP
//     const otp = optgenerator.generate(6, {
//       digits: true,
//       lowerCaseAlphabets: false,
//       upperCaseAlphabets: false,
//       specialChars: false,
//     });

//     console.log("otp is ", otp);

//     // Check if an OTP exists for the email
//     const existingOtp = await Otp.findOne({ email: email });

//     if (existingOtp) {
//       // Update existing OTP
//       existingOtp.otp = otp;
//       await existingOtp.save(); // Save the updated OTP
//       console.log("Updated OTP for existing user");
//     } else {
//       // Save new OTP to database
//       await Otp.create({ email: email, otp: otp });
//       console.log("Created new OTP for user");
//     }

//     return res.status(200).json({
//       success: true,
//       message: "OTP generated successfully",
//       otp, // Optionally return the generated OTP
//     });
//   } catch (error) {
//     console.log("error while generating OTP", error); // Added error logging
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while generating OTP",
//     });
//   }
// };

// export const ResetPassword = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   // fetch the email password otp from req.body
//   // validate it
//   // check if user user exists or not
//   // check if otp is correct or not
//   // update the password
//   // return success response

//   try {
//     // fetch the email password otp from req.body
//     const { email, password, otp } = req.body;
//     console.log("email is ", email);
//     console.log("password is ", password);
//     console.log("otp is ", otp);
//     // validate it
//     if (!email || !password || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }
//     // check if user user exists or not
//     const isUserExist = await User.findOne({ email: email });

//     if (!isUserExist) {
//       return res.status(400).json({
//         success: false,
//         message: "User not found",
//       });
//     }
//     // check if otp is correct or not
//     const dbotp = await Otp.findOne({ email: email });
//     console.log("dbotp is ", dbotp);

//     if (!dbotp) {
//       return res.status(400).json({
//         success: false,
//         message: "otp timeout. please try again",
//       });
//     }
//     if (dbotp?.otp !== otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }

//     // update the password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await User.updateOne({ email: email }, { password: hashedPassword });
//     // return success response
//     return res.status(200).json({
//       success: true,
//       message: "Password reset successfully",
//     });
//   } catch (error) {
//     console.log("could not reset the password", error);
//     return res.status(500).json({
//       success: false,
//       message: "could not reset the password",
//     });
//   }
// };

// export const changePassword = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { email, oldPassword, newPassword } = req.body;
//     console.log("email is ", email);
//     console.log("oldPassword is ", oldPassword);
//     console.log("newPassword is ", newPassword);
//     if (!email || !oldPassword || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }
//     const isUserExist = await User.findOne({ email: email }, {}, { new: true });

//     if (!isUserExist) {
//       return res.status(400).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // check new password is not same as old password
//     if (bcrypt.compareSync(newPassword, isUserExist.password)) {
//       return res.status(400).json({
//         success: false,
//         message: "New password cannot be same as old password",
//       });
//     }

//     if (!(await bcrypt.compare(oldPassword, isUserExist.password))) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid old password",
//       });
//     } else {
//       const hashedPassword = await bcrypt.hash(newPassword, 10);
//       await User.updateOne({ email: email }, { password: hashedPassword });

//       return res.status(200).json({
//         success: true,
//         message: "Password changed successfully",
//       });
//     }
//   } catch (error) {
//     console.log("could not change the password", error);
//     return res.status(500).json({
//       success: false,
//       message: "could not change the password",
//     });
//   }
// };
