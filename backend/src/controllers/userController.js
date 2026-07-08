import User from "../models/User.js";

// @desc   List all users (without passwords)
// @route  GET /api/users   (admin only)
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

// @desc   Create a new user (staff account)
// @route  POST /api/users  (admin only)
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Friendly duplicate check (the unique index also guards this)
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "A user with this email already exists" });
  }

  const user = await User.create({ name, email, password, role });

  // Never send the password hash back
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

// @desc   Delete a user
// @route  DELETE /api/users/:id  (admin only)
export const deleteUser = async (req, res) => {
  // An admin must not delete their own account (would lock themselves out).
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.deleteOne();
  res.json({ message: "User deleted" });
};
