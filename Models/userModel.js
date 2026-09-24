const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name!"],
  },
  email: {
    type: String,
    required: [true, "User must have an email!"],
    unique: [true, "This email already exists!"],
  },
  password: {
    type: String,
    required: [true, "Please enter the password."],
    maxLength: [16, "Password must be fewer than 16 characters."],
    minLength: [8, "Password must be at least 8 characters."],
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, "Please provide password confirmation."],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Passwords do not match",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const saltRounds = process.env.NODE_ENV === "test" ? 4 : 12;
  const passwordHash = await bcrypt.hash(this.password, saltRounds);
  this.password = passwordHash;
});

userSchema.pre("save", function () {
  this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (!this.passwordChangedAt) return false;

  const passwordChangedAt = Math.floor(this.passwordChangedAt.getTime() / 1000);

  return passwordChangedAt >= JWTTimestamp;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
