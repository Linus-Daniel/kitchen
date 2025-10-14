import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "recipientModel",
    required: true,
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ["User", "Vendor"],
  },
  type: {
    type: String,
    required: true,
    enum: [
      "order_placed",
      "order_confirmed",
      "order_preparing",
      "order_ready",
      "order_delivered",
      "order_cancelled",
      "payment_received",
      "review_received",
      "product_approved",
      "product_rejected",
      "vendor_approved",
      "vendor_rejected",
      "general",
    ],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  actionUrl: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);