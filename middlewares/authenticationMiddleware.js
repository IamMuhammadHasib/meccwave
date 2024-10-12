const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  const token = authHeader.split(' ')[1];
  // console.log(token);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    // Attach the decoded token (which contains user information) to the request
    req.user = decoded;
    // console.log(req.user);
    next();
  });
};

module.exports = authenticate;
