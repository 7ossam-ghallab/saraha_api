export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const schemaKeys = Object.keys(schema)

    for (const key of schemaKeys) {
      const result = schema[key].validate(req[key]);
      console.log(result)
    }
    next();
  }
}