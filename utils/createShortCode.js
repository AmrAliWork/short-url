const crypto = require("crypto");

function createShortCode() {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    const index = crypto.randomInt(0, characters.length);
    code += characters[index];
  }
  return code;
}
module.exports = createShortCode;
