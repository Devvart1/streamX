import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
// app.use((req, res, next) => {
//   console.log(`dwdew${req.method} ${req.url}`);
//   next();
// });

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // use assets from public dir
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
app.get('/test', (req, res) => {
  res.status(200).send('Server is running');
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subs", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/dash", dashboardRouter);

export { app };
