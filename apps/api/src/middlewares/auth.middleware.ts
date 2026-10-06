import type { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { ApiError } from "../lib/error.js";

export const authMiddleware = (): RequestHandler => async (req, _res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session) {
      return next(new ApiError("Unauthorized", 401));
    }

    req.user = {
      ...session.user,
      image: session.user.image ?? null
    };
    req.session = {
      ...session.session,
      ipAddress: session.session.ipAddress ?? null,
      userAgent: session.session.userAgent ?? null
    };
    return next();
  } catch (error) {
    return next(error);
  }
};

export default authMiddleware;
