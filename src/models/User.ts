import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter valid email address"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [6, "Your password must be longer than 6 characters"],
    select: false,
  },
  phone: {
    type: String,
    required: [true, "Please enter your phone number"],
  },
  avatar: {
    type: String,
    default: "",
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  addresses: [{
    label: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'Nigeria' },
    isDefault: { type: Boolean, default: false },
    type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    createdAt: { type: Date, default: Date.now },
  }],
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "vendor"],
  },
  businessName: {
    type: String,
    required: function(this: any) {
      return this.role === 'vendor';
    },
  },
  businessDescription: String,
  businessCategory: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
  },
  preferences: {
    newsletter: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  lastLoginAt: Date,
  isActive: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    this.updatedAt = new Date();
    next();
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
  this.updatedAt = new Date();
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  this.resetPasswordToken = bcrypt.hashSync(resetToken, 10);
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  
  return resetToken;
};

userSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  this.emailVerificationToken = bcrypt.hashSync(verificationToken, 10);
  
  return verificationToken;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
