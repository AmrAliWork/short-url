const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const catchAsync = require("../utils/catchAsync");
exports.protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      status: "fail",
      message: "Please log in first",
    });
    return;
  }

  const decoded = jwt.verify(authHeader.split(" ")[1], process.env.SECRET_KEY);

  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(404).json({
      status: "fail",
      message: "User not found",
    });
    return;
  }
  if (user.changedPasswordAfter(decoded.iat)) {
    res.status(401).json({
      status: "fail",
      message: "Please log in first",
    });
    return;
  }

  req.user = user;
  next();
});
