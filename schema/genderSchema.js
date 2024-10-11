const {z} = require('zod');

const genderScema = z.enum(['male', 'female']);

module.exports = genderScema;