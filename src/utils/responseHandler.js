class ResponseHandler {
  static sendResponse(
    res,
    statusCode,
    success,
    message,
    data = null,
    metadata = {}
  ) {
    const response = { success, message };

    if (data !== null) response.data = data;
    if (metadata !== null && Object.keys(metadata).length > 0)
      response.metadata = metadata;

    return res.status(statusCode).json(response);
  }

  static success(
    res,
    statusCode = 200,
    message = "Success",
    data = null,
    metadata = {}
  ) {
    return this.sendResponse(res, statusCode, true, message, data, metadata);
  }

  static error(
    res,
    statusCode = 500,
    message = "Something went wrong",
    error = null,
    metadata = {}
  ) {
    return this.sendResponse(res, statusCode, false, message, error, metadata);
  }
}

export default ResponseHandler;
