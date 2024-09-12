import { Router } from "express";

import { toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/subscribe/:chennelId").post(toggleSubscription);

export default router;
