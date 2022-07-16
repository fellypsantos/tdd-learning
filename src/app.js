const express = require('express');
const userRoutes = require('./routes/UserRoutes');
const i18next = require('i18next');
const backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const app = express();

i18next
  .use(backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    preload: ['en', 'pt'],
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      lookupHeader: 'accept-language',
    },
  });

app.use(middleware.handle(i18next));
app.use(express.json());
app.use(userRoutes);

module.exports = app;
