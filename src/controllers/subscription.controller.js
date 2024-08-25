import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { userId } = req.user;
  if (!channelId || !userId) {
    return res.status(400).json({ message: "Invalid Request" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "Invalid User Req" });
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    return res.status(404).json({ message: "Invalid Channel Req" });
  }
  const subscription = await User.aggregate([
    {
      $match: {
        _id: userId,
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
      $project: {
        _id: 0,
      },
    },
  ]);

  //   const subscription=await Subscription.create({
  //     subscriber: userId,
  //     channel: channelId,
  //   });
  console.log(subscription);
  res.status(200).json(new ApiResponse(200, "Toggle Subscription"));
});

export { toggleSubscription };
