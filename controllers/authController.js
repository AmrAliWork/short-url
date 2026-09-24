const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");

const createToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.SECRET_KEY);
  return token;
};

exports.signUp = async (req, res, next) => {
  try {
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    };
    const newUser = await User.create(userData);

    newUser.password = undefined;
    const token = createToken(newUser._id);
    res.status(201).json({
      status: "success",
      data: newUser,
      token,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    if (
      typeof req.body.email !== "string" ||
      typeof req.body.password !== "string"
    ) {
      return res.status(401).json({
        status: "fail",
        message: "Email or password is invalid",
      });
    }
    if (!req.body.password || !req.body.email) {
      return res.status(401).json({
        status: "fail",
        message: `Email or password is invalid `,
      });
    }

    const user = await User.findOne({ email: req.body.email }).select(
      "+password",
    );

    if (
      !user ||
      !(await user.correctPassword(req.body.password, user.password))
    ) {
      res.status(401).json({
        status: "fail",
        message: "Email or password is invalid",
      });
      return;
    }
    const token = createToken(user._id);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    next(err);
  }
};
