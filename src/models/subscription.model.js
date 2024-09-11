import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // who is subscribing
      ref: "User",
      required: true,
    },
    chennel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
