import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // use assets from public dir
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/subs", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);

export { app };
