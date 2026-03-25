import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const db = new Database('./db/plants.db')
const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'PlantCare API' })
})

app.get('/plants', (c) => {
  return c.json({
    plants: [
      { id: 1, name: 'Monstera' }
    ]
  })
})
console.log("Server running on http://localhost:3000")

serve({
  fetch: app.fetch,
  port: 3000
})