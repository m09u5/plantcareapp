import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`Serwer działa na http://localhost:${env.port}`);
  console.log(`Dokumentacja Swagger: http://localhost:${env.port}/api-docs`);
});
