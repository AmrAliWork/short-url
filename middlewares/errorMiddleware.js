const AppError = require("../utils/AppError");

const handleValidationError = (err) => {
  const errors = {};
  Object.keys(err.errors).forEach((field) => {
    errors[field] = err.errors[field].message;
  });
  return {
    message: "Invalid input",
    statusCode: 400,
    errors,
  };
};

const handleDuplicateError = (err) => {
  return new AppError(err.message, 400);
};
const handleJWTError = (err) => {
  return new AppError("Invalid token. Please log in again.", 401);
};
const handleJWTExpired = (err) => {
  return new AppError("Your token has expired. Please log in again.", 401);
};
const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") err = handleValidationError(err);
  else if (err.cause?.code === 11000) err = handleDuplicateError(err);
  else if (err.name === "JsonWebTokenError") err = handleJWTError(err);
  else if (err.name === "TokenExpiredError") err = handleJWTExpired(err);
  res.status(err.statusCode ?? 500).json({
    status: "error",
    message: err.statusCode === 500 ? "Something went wrong!" : err.message,
    errors: err.errors,
  });
};

module.exports = errorHandler;
