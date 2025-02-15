import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
 
    const { page = 1, limit = 3 } = req.query; 

    const comments = await Comment.find({video: videoId}).skip((page - 1) * limit) .limit(Number(limit));
    return res.status(200).json(new ApiResponse(200,  comments, "Comments fetched"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
const videoId = req.params.videoId;
const { content } = req.body;
const owner = req.user._id;
if (!content) {
    throw new ApiError(400, "Content is required");
}
const comment = await Comment.create({
    content,
    video: videoId,
    owner,
})
return res.status(200).json(new ApiResponse(200,comment, "Comment added"));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }
    comment.content = content;
    await comment.save();
    return res.status(200).json(new ApiResponse(200,  comment,"Comment updated"));

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    const userId = req.user._id;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }
    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(new ApiResponse(200, "Comment deleted"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }