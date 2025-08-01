// File: backend/middleware/adminMiddleware.js

/**
 * Middleware to protect admin-only routes.
 * It checks if the user object attached by the 'protect' middleware is an admin.
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // User is an admin, proceed to the next middleware/controller
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};
