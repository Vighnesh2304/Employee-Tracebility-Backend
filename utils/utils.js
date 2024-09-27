//cors option
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

module.exports = { corsOptions };
