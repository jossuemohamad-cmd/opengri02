/**
 * LECASU GridOps - Root Application Entrypoint
 * Compatibilidade nativa com cPanel Phusion Passenger e ambientes Node.js de produção.
 */
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '2';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('./server/server.js');
