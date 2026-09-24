const User = require("../Models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const fieldValidator = require("../utils/fieldValidator");
exports.getUser = (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: req.user,
  });
};

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  res.status(201).json({
    status: "success",
    data: user,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  fieldValidator(req.body, "email", "name");

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { returnDocument: "after", runValidators: true },
  );

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (
    typeof req.body.currentPassword !== "string" ||
    typeof req.body.password !== "string" ||
    typeof req.body.passwordConfirm !== "string"
  ) {
    return next(new AppError("Invalid password data", 400));
  }
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    res.status(400).json({
      status: "fail",
      message: "Please enter the correct current password",
    });
    return;
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordChangedAt = new Date();
  await user.save();
  user.password = undefined;
  res.status(200).json({
    status: "success",
    data: user,
  });
});
