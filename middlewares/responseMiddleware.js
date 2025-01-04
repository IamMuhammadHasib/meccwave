module.exports = (req, res, next) => {
  res.success = (data = {}, message = "Success", statusCode = 200) => {
    res.status(statusCode).json({
      statusCode,
      success: 1,
      message,
      ...data,
    });
  };

  res.error = (message = "Error", statusCode = 500) => {
    res.status(statusCode).json({
      statusCode,
      success: 0,
      message,
    });
  };

  next();
};
