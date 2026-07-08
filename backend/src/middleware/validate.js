import { validationResult } from "express-validator";

// Runs after the validation chains on a route. If any rule failed, it
// responds with 400 and the messages; otherwise it passes control to the
// controller. This keeps controllers free of repetitive input checks.
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg, // first problem as the main message
      errors: errors.array().map((e) => ({
        field: e.path || e.param, // works across express-validator versions
        message: e.msg,
      })),
    });
  }
  next();
};
