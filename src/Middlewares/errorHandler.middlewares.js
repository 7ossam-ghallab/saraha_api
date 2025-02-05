export const errorHandler = (api) => {
  return (req, res, next) => {
    api(req, res, next).catch((err) => {
      if (err) {
        console.error(`ERROR IN :${req.url}`, err);
        return next(new Error(err.message, {cause : 500}));
      }
    });
  }
}

export const globalErrorHandler = (err, req, res, next) => {
  console.log(`global error handler : ${err.message}`)
  return res.status(err.status || 500).json({ message: err.message });
}