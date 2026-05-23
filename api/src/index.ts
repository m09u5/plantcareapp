import express, { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(express.json());

// --- Kuloodporna konfiguracja Swaggera (Obiekt JS zamiast komentarzy) ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PlantCare API',
      version: '1.0.0',
      description: 'API do zarządzania podlewaniem roślin',
    },
    paths: {
      '/plants': {
        get: {
          summary: 'Pobiera listę wszystkich roślin',
          responses: {
            '200': { description: 'Lista roślin' }
          }
        },
        post: {
          summary: 'Dodaje nową roślinę',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    interval: { type: 'integer' },
                    userId: { type: 'integer' }
                  }
                }
              }
            }
          },
          responses: {
            '201': { description: 'Utworzono roślinę' },
            '400': { description: 'Błąd podczas tworzenia' }
          }
        }
      }
    }
  },
  // Pusta tablica - wyłączamy awaryjne skanowanie komentarzy, które powodowało błąd!
  apis: [], 
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// --- Endpointy (już bez problematycznych komentarzy @openapi) ---

app.get('/plants', async (req: Request, res: Response) => {
  const plants = await prisma.plant.findMany();
  res.json(plants);
});

app.post('/plants', async (req: Request, res: Response) => {
  const { name, interval, userId } = req.body;
  try {
    const newPlant = await prisma.plant.create({
      data: { name, interval, userId },
    });
    res.status(201).json(newPlant);
  } catch (error) {
    res.status(400).json({ error: "Błąd podczas tworzenia rośliny. Upewnij się, że userId istnieje." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
  console.log(`Dokumentacja Swagger: http://localhost:${PORT}/api-docs`);
});