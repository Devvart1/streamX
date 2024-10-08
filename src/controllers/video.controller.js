import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";

const getAllVideos = asyncHandler(async (req, res) => {
  // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  const { page = 1, limit = 3 } = req.query; 
  //TODO: get all videos based on query, sort, pagination
  const videos = await Video.find()
  .skip((page - 1) * limit) // Skip videos for previous pages
  .limit(Number(limit)); // Limit the number of videos returned

const totalVideos = await Video.countDocuments(); // Count total videos for pagination info

res.status(200).json(new ApiResponse(200,"Video fetched",{
  page: Number(page),
  limit: Number(limit),
  totalVideos,
  totalPages: Math.ceil(totalVideos / limit),
  videos,
}));

});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }
  const videoFile = req.files?.videoFile[0];
  const thumbnail = req.files?.thumbnail[0];

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }
  const videoFileUrl = await uploadOnCloudinary(videoFile.path);
  const thumbnailUrl = await uploadOnCloudinary(thumbnail.path);
  const { duration } = videoFileUrl;
  const video = await Video.create({
    videoFile: videoFileUrl?.url,
    thumbnail: thumbnailUrl?.url,
    title,
    description,
    duration,
    owner: req.user._id,
  });
  console.log(video);

  if (!video) {
    throw new ApiError(400, "Something went wrong while uploading video");
  }

  return res.status(200).json(new ApiResponse(200, "Video published", video));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Video fetched successfully", video));
});


const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { newTitle, description, thumbnail } = req.body;

  // Check if the video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if the user is authorized to update the video
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "User is not authorized to update this video");
  }

  // Update the video using findByIdAndUpdate
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      title: newTitle || video.title, // Use new title if provided, else retain the old one
      description: description || video.description, // Use new description if provided, else retain the old one
      thumbnail: thumbnail || video.thumbnail, // Use new thumbnail if provided, else retain the old one
    },
    { new: true } // This option returns the updated document
  );

  // Return the updated video
  res.status(200).json(new ApiResponse(200, "Video updated successfully", updatedVideo));
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  await video.remove();
  await video.save();
  res.status(200).json(new ApiResponse(200, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  video.isPublished = !video.isPublished;
  await video.save();
  res.status(200).json(new ApiResponse(200, "Video publish status updated"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
