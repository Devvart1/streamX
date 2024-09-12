import { Router } from "express";

import {
  toggleSubscription,
  getSubscribedchannels,
  getUserchannelSubscribers,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/c/:chennelId").get(toggleSubscription);
router.route("/getSubscribedchannels").get(getSubscribedchannels);
router.route("/getUserchannelSubscribers").get(getUserchannelSubscribers);

export default router;
