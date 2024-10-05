const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { csrfProtection } = require("./csrfMiddleware");

module.exports = (app) => {
  app.use(cors());
  app.use(morgan("dev"));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(passport.initialize());

  // CSRF middleware for authenticated routes
  app.use((req, res, next) => {
    if (
      ["POST", "PUT", "DELETE", "PATCH"].includes(req.method) &&
      req.isAuthenticated && req.isAuthenticated()
    ) {
      return csrfProtection(req, res, next);
    }
    next();
  });
};
