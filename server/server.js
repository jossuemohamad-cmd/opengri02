/**
 * LECASU GridOps - Servidor Principal (Backend)
 * 
 * Plataforma de Gestão Técnica, Comercial e Operacional para
 * Mini-Redes de Eletrificação Rural em Moçambique.
 * 
 * LECASU, Lda.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const { closePool } = require('./config/db');
const apiRoutes = require('./routes/api');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const { startTelemetryAutoSyncScheduler, stopTelemetryAutoSyncScheduler } = require('./controllers/telemetryController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares essenciais para parsing do corpo das requisições
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cabeçalhos de segurança e CORS básicos
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-webhook-key');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Registo de requisições em ambiente de desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// Servir ficheiros estáticos do frontend (Vanilla JS SPA)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Rotas da API REST
app.use('/api', apiRoutes);

// Fallback para SPA (Single Page Application) em rotas não-API
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Middleware para rotas da API não encontradas (404)
app.use(notFoundHandler);

// Middleware centralizado de tratamento de erros
app.use(globalErrorHandler);

// Inicialização do Servidor HTTP
const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`⚡ LECASU GridOps Server a correr na porta ${PORT}`);
  console.log(`🌐 Frontend:    http://localhost:${PORT}`);
  console.log(`🩺 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`🛠️ Ambiente:    ${process.env.NODE_ENV || 'development'}`);
  console.log('====================================================');
  if (process.env.NODE_ENV !== 'test') {
    startTelemetryAutoSyncScheduler();
  }
});

// Tratamento de erros no arranque do servidor (ex.: porta ocupada)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[ERRO CRÍTICO] A porta ${PORT} já está ocupada por outro processo.`);
    console.error(`[DICA] Encerre a instância anterior ou altere a porta no ficheiro .env.`);
  } else {
    console.error('[ERRO CRÍTICO] Falha ao inicializar o servidor HTTP:', err);
  }
  process.exit(1);
});

// Tratamento de encerramento gracioso (Graceful Shutdown)
let isShuttingDown = false;

async function handleGracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[SISTEMA] Sinal ${signal} recebido. A iniciar encerramento gracioso...`);
  stopTelemetryAutoSyncScheduler();

  // Pára de aceitar novas requisições HTTP
  server.close(async () => {
    console.log('[HTTP] Servidor HTTP encerrado com sucesso.');

    try {
      // Fecha as ligações à base de dados PostgreSQL
      await closePool();
      console.log('[SISTEMA] Encerramento concluído com sucesso. Até à próxima!');
      process.exit(0);
    } catch (err) {
      console.error('[ERRO] Falha ao encerrar pool da base de dados:', err);
      process.exit(1);
    }
  });

  // Força encerramento se demorar mais de 10 segundos
  setTimeout(() => {
    console.error('[SISTEMA] Tempo limite de encerramento excedido. Forçar saída imediata.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

module.exports = { app, server };

