const jwt = require('jsonwebtoken');
const Jwt_Secret = "MynameisAh%med";

const fetchuser = (req, res, next) => {
  const token = req.header("auth-token"); // ✅ match frontend
  if (!token) {
    return res.status(401).json("Please authenticate using a valid token");
  }

  try {
    const data = jwt.verify(token, Jwt_Secret);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).json("Please authenticate using a valid token");
  }
};

module.exports = fetchuser;
