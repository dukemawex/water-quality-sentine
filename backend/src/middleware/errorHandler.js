/**
 * Global error handler middleware.
 * Catches errors thrown by route handlers and formats a consistent response.
 */
const errorHandler = (err, req, res, _next) => {
  console.error(err.stack || err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation failed', details: messages });
  }

  // Mongoose cast error (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  // Default to 500
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
