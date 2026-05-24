import express from 'express';

import { authRouter } from './modules/auth/auth.routes.js';
import { plantsRouter } from './modules/plants/plants.routes.js';
import { swaggerUiServe, swaggerUiSetup } from './swagger.js';

export const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUiServe, swaggerUiSetup);
app.use('/auth', authRouter);
app.use('/plants', plantsRouter);
