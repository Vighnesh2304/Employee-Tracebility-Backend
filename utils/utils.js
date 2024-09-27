//cors option
const corsOptions = {
  origin: '*',
  methods: 'GET,POST',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

module.exports = { corsOptions };
