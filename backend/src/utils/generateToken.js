import jwt from "jsonwebtoken";

// Creates a signed JWT that stores the user's id.
// It expires after the time set in .env (e.g. 7 days).
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export default generateToken;