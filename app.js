/**
 * LECASU GridOps - Root Application Entrypoint
 * Compatibilidade nativa com cPanel Phusion Passenger e ambientes Node.js de produção.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('./server/server.js');
