import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  if (!channelId || !userId) {
    return res.status(400).json({ message: "Invalid Request" });
  }
  const channel = await User.findById(channelId);

  if (!channel) {
    return res.status(404).json({ message: "Invalid channel" });
  }

  const subscriptions = await Subscription.find({
    subscriber: userId,
    channel: channelId,
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
    channel: channelId,
  });

  console.log("Subscribed");
  res.status(200).json(new ApiResponse(200, "Subscribed Successfully"));
});

// controller to return subscriber list of a channel
const getUserchannelSubscribers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "Invalid channel" });
  }

  // const subscribers = await Subscription.find({ channel: req.user._id });
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
        foreignField: "channel",
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
  res.status(200).json(new ApiResponse(200, "Subscribers", subscriberIds));
});

// controller to return channel list to which user has subscribed
const getSubscribedchannels = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "Invalid channel" });
  }

  // const Channels = await Subscription.find({ subscriber: req.user._id });
  // const channelIds = Channels.map((sub) => sub.channel);
  const Channels = await User.aggregate([
    {
      $match: {
        _id: user._id,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "channels",
      },
    },
    {
      $project: {
        channels: 1,
      },
    },
  ]);

  const channelIds = Channels[0]?.channels.map((sub) => sub.channel);

  res.status(200).json(new ApiResponse(200, "Channels", channelIds));
});
export { toggleSubscription, getUserchannelSubscribers, getSubscribedchannels };
