require('reflect-metadata');
const express = require('express');

const server = express();
let appPromise = null;

async function bootstrap() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set on this Vercel project.');
  }

  const { NestFactory } = require('@nestjs/core');
  const { ExpressAdapter } = require('@nestjs/platform-express');
  const { ValidationPipe } = require('@nestjs/common');
  const { AppModule } = require('../dist/app.module');

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

module.exports = async (req, res) => {
  try {
    if (!appPromise) appPromise = bootstrap();
    await appPromise;
    server(req, res);
  } catch (err) {
    appPromise = null;
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'bootstrap_failed', message: err && err.message, stack: err && err.stack }));
  }
};
