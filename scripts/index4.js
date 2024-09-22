import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import boxen from 'boxen';
import open from 'open';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  const url = `http://localhost:${PORT}`;

  console.log(boxen(`Server is running on ${url}`, { padding: 1, margin: 1, borderStyle: 'double' }));

  // Open the URL in the default browser
  await open(url);

  // Display a tick mark and final message
  console.log(boxen('✔ Server is up and running!', { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'green' }));
});