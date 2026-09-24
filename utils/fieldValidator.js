const AppError = require("./AppError");
function fieldValidator(data, ...allowed) {
  for (const key of Object.keys(data)) {
    if (!allowed.includes(key)) {
      throw new AppError(`Field "${key}" is not allowed`, 400);
    }
  }
}
module.exports = fieldValidator;
