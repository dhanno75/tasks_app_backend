import User from "../models/userModel.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail, sendVerificationEmail } from "../utils/email.js";
import Verification from "../models/verificationModel.js";

// SIGN UP
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({
        status: "fail",
        message: "User already exists",
      });
    } else {
      const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm,
        verified: false,
      });

      // Generate & hashing a random token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

      // Verification URL which is going to be sent to the newly signed up user
      const verificationURL = `${req.protocol}://localhost:3000/verify/${newUser._id}/${verificationToken}`;

      // message
      const message = `Verify your email address to complete the signup process. This ${verificationURL} link expires in 6 hours`;

      // Sending the verification email
      await sendVerificationEmail({
        email,
        subject: "Please verify yourself",
        message,
      });

      const userVerification = await Verification.create({
        userId: newUser._id,
        uniqueString: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });

      return res.status(201).json({
        status: "success",
        message: "Verification link sent to the user's email successfully",
        data: userVerification,
        user: newUser,
      });
    }
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: "Please try again",
    });
  }
};

// SIGN UP VERIFICATION
export const userVerified = async (req, res, next) => {
  try {
    let { userId, uniqueString } = req.params;

    const userExists = await Verification.findOne({ userId });

    if (!userExists) {
      return res.status(404).json({
        satus: "fail",
        message: "There is no user with this id",
      });
    }

    const expiresAt = userExists.expiresAt;

    if (expiresAt < Date.now()) {
      await Verification.findByIdAndDelete(userExists._id);
      await User.findByIdAndDelete(userExists.userId);
      return res.status(400).json({
        status: "fail",
        message: "The link has expired please signup again",
      });
    }

    const hashedString = crypto
      .createHash("sha256")
      .update(uniqueString)
      .digest("hex");

    const hashedUser = await Verification.findOne({
      uniqueString: hashedString,
    });

    if (!hashedUser) {
      return res.status(404).json({
        status: "fail",
        message: "The link is invalid",
      });
    } else {
      await User.findByIdAndUpdate(hashedUser.userId, { verified: true });

      return res.status(201).json({
        message: "success",
        status: "Signed Up Successfully!",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong. Please try after some time.",
    });
  }
};

// LOGIN
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid login credentials",
    });
  }

  if (user.verified === false) {
    return res.status(400).json({
      status: "fail",
      message: "Please verify your email address!",
    });
  }

  const dbPassword = user.password;
  const passwordCheck = await bcrypt.compare(password, dbPassword);

  if (passwordCheck) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "90d",
    });

    res.status(200).json({
      status: "success",
      message: "Successful Login",
      token,
      data: user,
    });
  } else {
    res.status(401).json({
      status: "fail",
      message: "Invalid login credentials",
    });
  }
};

// AUTH
export const auth = async (req, res, next) => {
  try {
    const token = req.header("token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    let currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      res.status(401).json({
        status: "fail",
        message: "Unauthorized access!",
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).send({ message: err.message });
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({
      status: "fail",
      message: "There is no user with this email address",
    });
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  const resetURL = `${req.protocol}://localhost:3000/resetPassword/${resetToken}`;

  const message = `Forgot your password? Click on this link to submit a new request to reset your password to: ${resetURL} .\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token(valid for 10 minutes)",
      message,
    });

    res.status(200).send({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      status: "fail",
      message: "There was an error sending the email. Please try again later.",
    });
  }
};

export const resetPassword = async (req, res, next) => {
  // Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token has not expired, and there is user, set the new password
  if (!user) {
    return res.status(400).json({
      status: "fail",
      message: "Token is invalid or MongoExpiredSessionError",
    });
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "90d",
  });

  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
};
