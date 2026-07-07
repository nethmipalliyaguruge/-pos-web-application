// Handles routes that don't exist (404)
export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Catches any error thrown anywhere in the app and sends a clean JSON response
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  // Mongoose bad ObjectId (e.g. /products/abc where abc isn't a valid id)
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Mongoose validation errors (e.g. missing required field)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Duplicate key (e.g. SKU or email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }

  // Anything else
  res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
};