//cors option
const corsOptions = {
  origin: ['https://employee-tracebility.vercel.app'], // allow only requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: true, // add this option to handle preflight requests
};

module.exports = { corsOptions };
