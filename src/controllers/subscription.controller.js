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
    return res.status(404).json({ message: "Invalid chennel" });
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

// controller to return subscriber list of a chennel
const getUserchennelSubscribers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "Invalid chennel" });
  }

  // const subscribers = await Subscription.find({ chennel: req.user._id });
  // const subscriberIds = subscribers.map((sub) => sub.subscriber);
  const Subscribers = await User.aggregate([
    {
      $match: {
        _id: user._id,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "chennel",
        as: "subscribers",
      },
    },
    {
      $project: {
        subscribers: 1,
      },
    },
  ]);
  const subscriberIds = Subscribers[0]?.subscribers.map(
    (sub) => sub.subscriber
  );
  console.log(Subscribers.subscriberIds);
  res.status(200).json(new ApiResponse(200, "Subscribers", subscriberIds));
});

// controller to return chennel list to which user has subscribed
const getSubscribedchennels = asyncHandler(async (req, res) => {
  const user = await User.find(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "Invalid chennel" });
  }

  const channels = await Subscription.find({ subscriber: req.user._id });
  const chennelIds = channels.map((sub) => sub.chennel);
  // console.log(chennelIds);
  res.status(200).json(new ApiResponse(200, "Chennels", chennelIds));
});
export { toggleSubscription, getUserchennelSubscribers, getSubscribedchennels };
