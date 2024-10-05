const csrf = require("csrf");
const csrfTokens = new csrf();

const csrfProtection = (req, res, next) => {
  const csrfToken = req.cookies.csrfToken || req.headers["x-csrf-token"];
  if (!csrfToken || !csrfTokens.verify(process.env.CSRF_SECRET, csrfToken)) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  next();
};

const setCsrfToken = (req, res) => {
  const token = csrfTokens.create(process.env.CSRF_SECRET);
  res.cookie("csrfToken", token);
  return token;
};

module.exports = { csrfProtection, setCsrfToken };
