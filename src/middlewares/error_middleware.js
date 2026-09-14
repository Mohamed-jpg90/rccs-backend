const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid id: ${err.value}` });
  } // ده لو ال الايدي غلط الي انت بتجيب منه اليوزر و غيرهم
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({ message: `Duplicate value for field: ${field}` });
  }// (1100) is an error code famouse in the mongo that mean duplicate key
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }//if the full name is required then you miss it 
  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }//if you have 3 errors this funcion is give you all errors 

  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
};

module.exports = { notFound, errorHandler };
