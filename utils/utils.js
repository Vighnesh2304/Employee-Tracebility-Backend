//cors option
const corsOptions = {
  origin: '*',
  methods: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

module.exports = { corsOptions };
