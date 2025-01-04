const { z } = require("zod");

const genderScema = z.enum(["male", "female"], { message: "Invalid gender" });

module.exports = genderScema;
