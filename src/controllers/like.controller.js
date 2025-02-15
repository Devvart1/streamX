import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate video ID format
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const userId = req.user._id;

    // Check if the like already exists
    const like = await Like.findOne({ video: videoId, likedBy: userId });
    
    if (!like) {
        // Create a new like if none exists
        await Like.create({ video: videoId, likedBy: userId });
        return res.status(200).json(new ApiResponse(200, "Liked video"));
    }

    // Remove the like if it already exists
    await Like.deleteOne({ video: videoId, likedBy: userId });
    return res.status(200).json(new ApiResponse(200, "Unliked video"));
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

})

const togglePostLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    togglePostLike,
    toggleVideoLike,
    getLikedVideos
}