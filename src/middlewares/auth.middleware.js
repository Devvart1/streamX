import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // console.log(req.header("Authorization")?.replace("Bearer ", ""));
    let token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.accessToken;
    console.log("token: ", token);
    if (!token) {
      throw new ApiError(404, "Unauthorized request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(404, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access to token");
  }
});
