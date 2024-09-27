//cors option
const corsOptions = {
  origin: true, // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

module.exports = { corsOptions };
