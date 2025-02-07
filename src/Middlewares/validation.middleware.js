const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const schemaKeys = Object.keys(schema)

    let validationErrors = []
    for (const key of schemaKeys) {
      const {error} = schema[key].validate(req[key], {abortEarly : false}); // {abortEarly : false} to show all errors not the first
      // console.log(error)
      if (error) {
        validationErrors.push(...error.details);
      }
    }
    if (validationErrors.length) {
      return res.status(400).json({message : "validation Errors", errors: validationErrors });
    }
    next();
  }
}

export default validationMiddleware;