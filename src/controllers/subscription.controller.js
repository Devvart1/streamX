import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { chennelId } = req.params;
  const userId = req.user._id;

  if (!chennelId || !userId) {
    return res.status(400).json({ message: "Invalid Request" });
  }
  const chennel = await User.findById(chennelId);

  if (!chennel) {
    return res.status(404).json({ message: "Invalid Channel" });
  }

  const subscriptions = await Subscription.find({
    subscriber: userId,
    chennel: chennelId,
  });

  if (subscriptions.length > 0) {
    await Subscription.findByIdAndDelete(subscriptions[0]?._id);
    console.log("Unsubscribed");
    return res
      .status(200)
      .json(new ApiResponse(200, "Unsubscribed Successfully"));
  }

  const newSubscription = await Subscription.create({
    subscriber: userId,
    chennel: chennelId,
  });

  console.log("Subscribed");
  res.status(200).json(new ApiResponse(200, "Subscribed Successfully"));
});

export { toggleSubscription };
