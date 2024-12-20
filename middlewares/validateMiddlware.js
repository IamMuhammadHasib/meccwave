const validate = (schema) => {
  return (req, res, next) => {
    console.log("Request", req.body);
    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ errors: validationResult.error.errors });
    }

    next();
  };
};

module.exports = validate;
