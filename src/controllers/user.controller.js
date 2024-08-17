import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  /*  get user details from frontend
  velidation - not empty
  check if user is already exist:username , email
  check for image, check for avatar
  upload them to cloudinary and get the url of uploaded images.
  create user object -create entry in db
  remove password and refresh token and send response back to frontend with new refreshed token.
  check for user creation
  return res
  
*/

  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((item) => item?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with this username or this email already exist. Please try again"
    );
  }
  const avatarLocalPAth = req.files?.avatar[0]?.path;
  // const coverImagePath = req.files?.coverImage[0]?.path;
  let coverImagePath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagePath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPAth) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPAth);
  const coverImage = await uploadOnCloudinary(coverImagePath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar?.secure_url || "",
    coverImage: coverImage?.secure_url,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  console.log("User registered successfully");
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /*
  get data from body
  username or email
  find the user
  password check
  access and refresh 
  send cookie
  */

  const { email, username, password } = req.body;
  // console.log("email : ",email);
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }
  if (!password) {
    throw new ApiError(400, "password is required");
  }
  let user;
  if (username) {
    user = await User.findOne({ username });
    if (!user) {
      throw new ApiError(404, "Username does not exist");
    }
  }
  if (email) {
    user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User with email does not exist");
    }
  }
  /*
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  */
  // check if user already logged in

  if (user.refreshToken === req.cookies.refreshToken) {
    console.log("User already logged in");
    throw new ApiError(400, "User already logged in");
  }

  const isPasswordValit = await user.isPasswordCorrect(password);
  if (!isPasswordValit) {
    throw new ApiError(400, "Invalid User Credentials");
  }
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // console.log({ accessToken, refreshToken });
  const Options = {
    httpOnly: true,
    secure: true,
  };

  console.log("User Logged in successfully");
  return res
    .status(200)
    .cookie("accessToken", accessToken, Options)
    .cookie("refreshToken", refreshToken, Options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler((req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const Options = {
    httpOnly: true,
    secure: true,
  };

  console.log("User logged out");
  return res
    .status(200)
    .clearCookie("accessToken", Options)
    .clearCookie("refreshToken", Options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccesstoken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = re.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const Options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", newRefreshToken)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.messsage, "Invalid Refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldpassword, newpassword, confpassword } = req.body;
  if (!(newpassword == confpassword)) {
    throw new ApiError(400, "Password does not match");
  }
  const user = User.findById(req.user?._id);
  const isPasswordValid = await user.isPasswordCorrect(oldpassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid Password");
  }
  user.password = newpassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, res.user, "Current User details fetched successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password -refreshToken ");
  return res.status(200).json(200, user, "User details updated successfully");
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPAth = req.file?.avatar?.path;
  if (!avatarLocalPAth) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPAth);
  if (!avatar) {
    throw new ApiError(400, "Error while uploading Avatar");
  }
  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: { avatar: avatar.url },
    new: true,
  }).select("-password");
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPAth = req.file?.avatar?.path;
  if (!coverImageLocalPAth) {
    throw new ApiError(400, "CoverImage file is required");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPAth);
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading CoverImage");
  }
  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: { coverImage: coverImage.url },
    new: true,
  }).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }
  // select
  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase() },
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
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedTo: {
          $size: "$subscribedTo",
        },
        isSubscriber: {
          // $in:[req.user._id,"$subscribers.subscriber"]
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
            },
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelSubscribedTo: 1,
        isSubscriber: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel details fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id), // bcz _id is object id but req.user._id is string
      },
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccesstoken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
