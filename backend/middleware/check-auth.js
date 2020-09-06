const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];  // the header conventionally looks like "Bearer {token}"
    const decodedToken = jwt.verify(token, "secret_this_should_be_longer");
    req.userData = { name: decodedToken.name, phone: decodedToken.phone, userId: decodedToken.userId };
    next();
  } catch {
    res.status(401).json({
      message: "Could not verify token"
    });
  }
}
