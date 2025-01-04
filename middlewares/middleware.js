const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { csrfProtection } = require("./csrfMiddleware");
const reponseMiddleware = require("./responseMiddleware");

module.exports = (app) => {
  app.use(
    cors({
      origin: "*", // Allow requests from your frontend
      credentials: true, // Allow cookies to be sent/received
    })
  );
  app.use(morgan("dev"));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(reponseMiddleware);

  // CSRF middleware for state-changing routes
  app.use((req, res, next) => {
    if (
      ["POST", "PUT", "DELETE", "PATCH"].includes(req.method)
    ) {
      return csrfProtection(req, res, next);
    }
    next();
  });
};
