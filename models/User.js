const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES, BCRYPT_ROUNDS } = require("../constants");

/**
 * User schema supporting three roles: admin, instructor, student.
 * Passwords are stored as bcrypt hashes — never plain text.
 */
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    // OTP fields for password reset flow
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date },
  },
  { timestamps: true },
);

/** Hash plain password and store it */
UserSchema.methods.setPassword = async function (plainPassword) {
  this.passwordHash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
};

/** Compare a plain password against the stored hash */
UserSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

/** Never expose passwordHash or OTP fields in JSON responses */
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.resetOtp;
  delete obj.resetOtpExpiry;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
