import jwt, { decode } from "jsonwebtoken";
import ResponseHandler from "../utils/responseHandler.js";
import statusCodes from "../utils/statusCodes.js";
import User from "../models/user.Model.js";
import { response } from "express";
import { CustomError } from "../error.js";
/**
 * Middleware to check authentication (Token Required)
 */
export const protect = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token && req.cookies?.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    return ResponseHandler.error(
      res,
      statusCodes.UNAUTHORIZED,
      "Not authorized, token missing, login required for this route"
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return ResponseHandler.error(
        res,
        statusCodes.UNAUTHORIZED,
        "User not found"
      );
    }

    next();
  } catch (error) {
    const metadata = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };

    return ResponseHandler.error(
      res,
      statusCodes.UNAUTHORIZED,
      error.message || "Not authorized, invalid or expired token",
      (error = null),
      metadata
    );
  }
};

export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.admin_Token) {
    token = req.cookies.admin_Token;
  }

  if (!token) {
    return res.status(401).json({
      message: "No token, authorization denied. only admin can access",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.id).select("-password");
    req.admin = admin;
    req.adminKey = process.env.ADMIN_KEY;
    next();
  } catch (error) {
    return res.status(401).json({
      message:
        "Not authorized, invalid or expired token || only admin can access this route",
    });
  }
};

export const adminOnly = (req, res, next) => {

  if (
    req.admin &&
    req.admin.role === "admin" &&
    req.adminKey.toString() === process.env.ADMIN_KEY.toString()
  ) {
    next();
  } else {
    return ResponseHandler.error(
      res,
      statusCodes.FORBIDDEN,
      "Access denied, admin only"
    );
  }
};

export const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);

    const authToken = socket.request.cookies.token;

    if (!authToken)
      return next(new CustomError("Please login to access this route", 401));

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await User.findById(decodedData.id);

    if (!user)
      return next(new CustomError("Please login to access this route", 401));

    socket.user = user;

    return next();
  } catch (error) {
    return next(new CustomError("Please login to access this route", 401));
  }
};
