const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => next(err));
  };
};

export { asyncHandler };

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     fn(res, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
