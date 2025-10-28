import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const vendorSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, "Please enter your business name"],
      maxLength: [100, "Business name cannot exceed 100 characters"],
    },
    ownerName: {
      type: String,
      required: [true, "Please enter owner name"],
      maxLength: [50, "Owner name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
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
    description: {
      type: String,
      maxLength: [500, "Description cannot exceed 500 characters"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    cuisineType: [
      {
        type: String,
      },
    ],
    logo: {
      type: String,
      default: "/images/vendor-default.jpg",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    estimatedDeliveryTime: {
      type: String,
      default: "30-45 mins",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationDocuments: {
      businessLicense: String,
      foodSafetyPermit: String,
      identityDocument: String,
      businessRegistration: String,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: String,
    role: {
      type: String,
      default: "vendor",
    },
  },
  {
    timestamps: true,
  }
);

vendorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

vendorSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id, role: "vendor" }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

vendorSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
