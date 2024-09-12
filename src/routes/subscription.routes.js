import { Router } from "express";

import {
  toggleSubscription,
  getSubscribedchennels,
  getUserchennelSubscribers,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/c/:chennelId").get(toggleSubscription);
router.route("/getSubscribedchennels").get(getSubscribedchennels);
router.route("/getUserchennelSubscribers").get(getUserchennelSubscribers);

export default router;
