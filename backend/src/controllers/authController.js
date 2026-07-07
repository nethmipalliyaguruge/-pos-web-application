import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc   Log in a user with email + password
// @route  POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Check the password using the method from our User model
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Success — send back user info + a token
    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get the currently logged-in user
// @route  GET /api/auth/me
export const getMe = async (req, res) => {
  // req.user is set by our auth middleware
  res.json(req.user);
};