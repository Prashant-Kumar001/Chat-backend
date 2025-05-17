import ResponseHandler from "../utils/responseHandler.js";
import {
  getAllUsers,
  getAllChats,
  getAllMessages,
  getDashBordData,
  adminLogin,
} from "../services/admin.service.js";
import statusCodes from "../utils/statusCodes.js";
import { generateToken } from "../utils/helper.js";

const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};


export const fetchUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const users = await getAllUsers(page, limit);
    const metadata = {
      page,
      limit,
      total: users.total,
      totalPages: Math.ceil(users.total / limit),
      hasNextPage: page * limit < users.total,
      hasPreviousPage: page > 1,
      nextPage: page * limit < users.total ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    };
    return ResponseHandler.success(
      res,
      statusCodes.OK,
      "Users fetched successfully",
      users,
      metadata
    );
  } catch (error) {

    return ResponseHandler.error(
      res,
      error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
export const fetchChats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const chats = await getAllChats(page, limit);
    const metadata = {
      page,
      limit,
      total: chats.total,
      totalPages: Math.ceil(chats.total / limit),
      hasNextPage: page * limit < chats.total,
      hasPreviousPage: page > 1,
      nextPage: page * limit < chats.total ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    };
    return ResponseHandler.success(
      res,
      statusCodes.OK,
      "Chats fetched successfully",
      chats,
      metadata
    );
  } catch (error) {

    return ResponseHandler.error(
      res,
      error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
export const fetchMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const messages = await getAllMessages(page, limit);
    const metadata = {
      page,
      limit,
      total: messages.total,
      totalPages: Math.ceil(messages.total / limit),
      hasNextPage: page * limit < messages.total,
      hasPreviousPage: page > 1,
      nextPage: page * limit < messages.total ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    };
    return ResponseHandler.success(
      res,
      statusCodes.OK,
      "Messages fetched successfully",
      messages,
      metadata
    );
  } catch (error) {

    return ResponseHandler.error(
      res,
      error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
export const fetchDashBordData = async (req, res) => {
  try {
    const Data = await getDashBordData();
    return ResponseHandler.success(
      res,
      statusCodes.OK,
      "Dashboard data fetched successfully",
      Data
    );
  } catch (error) {
    return ResponseHandler.error(
      res,
      error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
export const admin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await adminLogin(email, password);

    if (!user) {
      return res.status(404).json({
        admin: false,
        timestamp: new Date().toISOString(),
        message: "Invalid credentials",
      })
    }

    const token = generateToken(user)
    if (!token) {
      return ResponseHandler.error(
        res,
        statusCodes.INTERNAL_SERVER_ERROR,
        "Token not generated"
      );
    }

    return res.status(200).cookie("admin_Token", token, cookieOptions).json({
      success: true,
      user,
      message: "logged in successful",
      username: user.username,
      role: user.role,
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("adminToken");
    return ResponseHandler.success(res, statusCodes.OK, "Logout successful");
  } catch (error) {
    return ResponseHandler.error(
      res,
      statusCodes.INTERNAL_SERVER_ERROR,
      "Logout failed",
      error.message
    );
  }
};

export const getAdminData = (req, res) => {

  res.json({
    admin: true,
    timestamp: new Date().toISOString(),
    message: "welcome Admin"
  })
}
