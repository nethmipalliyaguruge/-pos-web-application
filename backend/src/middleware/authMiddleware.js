import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protects routes: only lets requests through if they carry a valid token.
export const protect = async (req, res, next) => {
  let token;

  // The frontend sends the token in a header like: "Authorization: Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Pull the token out of the header
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify it's genuine using our secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Load the user (minus the password) and attach to the request
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      return next(); // all good — continue to the actual route
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // No token at all
  return res.status(401).json({ message: "Not authorized, no token" });
};

// Restricts a route to specific roles. Must run AFTER `protect` so that
// req.user is set. Example: router.post("/", protect, authorize("admin"), ...)
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "You do not have permission to perform this action" });
  }
  next();
};