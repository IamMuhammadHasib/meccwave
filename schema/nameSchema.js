const { z } = require("zod");

const nameSchema = z.string().max(128);

module.exports = nameSchema;