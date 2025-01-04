const validate = (schema) => {
  return (req, res, next) => {
    console.log("Request", req.body);
    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) {
      const firstError =
        validationResult.error.errors[0]?.message || "Validation failed";
      return res.error(firstError, 400);
    }

    next();
  };
};

module.exports = validate;
