import 'dotenv/config';
import './types';
import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth';
import clientsRouter from './routes/clients';
import invoicesRouter from './routes/invoices';
import quotesRouter from './routes/quotes';
import paymentsRouter from './routes/payments';
import settingsRouter from './routes/settings';

const app = express();
const PORT = process.env.PORT || 3001;

// Parse JSON
app.use(express.json());

// CORS manuel (doit être avant les routes)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:4173', 
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://orbital-command.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean) as string[];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Better-Auth handler
app.all('/api/auth/{*splat}', toNodeHandler(auth));

// Middleware d'authentification pour les routes API
const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    
    req.userId = session.user.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Session invalide' });
  }
};

// Routes API protégées
app.use('/api/clients', authMiddleware, clientsRouter);
app.use('/api/invoices', authMiddleware, invoicesRouter);
app.use('/api/quotes', authMiddleware, quotesRouter);
app.use('/api/payments', authMiddleware, paymentsRouter);
app.use('/api/settings', authMiddleware, settingsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 ORBITAL API Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints: /api/clients, /api/invoices, /api/quotes`);
});
