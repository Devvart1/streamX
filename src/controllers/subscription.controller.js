import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;
  console.log(channelId, userId);
  if (!channelId || !userId) {
    return res.status(400).json({ message: "Invalid Request" });
  }
  const channel = await User.findById(channelId);

  if (!channel) {
    return res.status(404).json({ message: "Invalid Channel" });
  }
  const findAllSubscriptions = await Subscription.find();
  console.log(findAllSubscriptions);
  const subscriptions = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        isSubscribed: {
          $in: [channelId, "$subscribedTo"],
        },
      },
    },
    {
      $project: {
        isSubscribed: 1,
      },
    },
  ]);
  // console.log(subscriptions);

  if (subscriptions[0]?.isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed._id);
    console.log("Unsubscribed");
    return res
      .status(200)
      .json(new ApiResponse(200, "Unsubscribed Successfully"));
  }
  const newSubscription = await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });
  console.log("Subscribed");
  res.status(200).json(new ApiResponse(200, "Subscribed Successfully"));
});

export { toggleSubscription };
