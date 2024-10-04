import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req?.user?._id;
    if (!userId) {
        return next(new ApiError(401, "Unauthorized"))
    }
    const user = await User.findById(userId);
    if (!user) {
        return next(new ApiError(404, "User not found"))
    }


    const videos =  await User.Aggregate([
        {
            $match: { _id: userId }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $project: {
                totalVideos: { $size: "$videos" },
                totalViews: { $sum: "$videos.views" },
                totalLikes: { $sum: "$videos.likes" }
            }
        }
    ])
    const subscribers = await Subscription.countDocuments({ channel: userId });
    videos[0].totalSubscribers = subscribers;
    console.log(videos[0]);
    return res.status(200).json(new ApiResponse(200, "Channel stats", videos[0]));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats,
    getChannelVideos
}