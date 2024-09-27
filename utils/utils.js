//cors option
const corsOptions = {
  origin: ['http://localhost:5174'], // allow only requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: true, // add this option to handle preflight requests
};

module.exports = { corsOptions };
