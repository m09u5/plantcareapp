import express from 'express';

import { authRouter } from './modules/auth/auth.routes.js';
import { plantsRouter } from './modules/plants/plants.routes.js';
import { swaggerUiServe, swaggerUiSetup } from './swagger.js';

export const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json({ limit: '6mb' }));
app.use('/api-docs', swaggerUiServe, swaggerUiSetup);
app.use('/auth', authRouter);
app.use('/plants', plantsRouter);
