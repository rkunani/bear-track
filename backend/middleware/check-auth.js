const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];  // the header conventionally looks like "Bearer {token}"
    jwt.verify(token, "secret_this_should_be_longer");
    next();
  } catch {
    res.status(401).json({
      message: "Could not verify token"
    });
  }
}
