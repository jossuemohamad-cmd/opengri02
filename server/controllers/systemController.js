/**
 * LECASU GridOps - Controlador de Operações de Sistema (/api/system)
 */

const { exec } = require('child_process');
const path = require('path');
const { success, error } = require('../utils/response');

/**
 * Repõe os dados de demonstração padrão do sistema executando o seed script oficial.
 * POST /api/system/reset-demo
 */
async function resetDemoData(req, res) {
  try {
    const scriptPath = path.join(__dirname, '../../scripts/seed_rich_demo_data.js');
    exec(`node "${scriptPath}"`, (err, stdout, stderr) => {
      if (err) {
        console.error('[SYSTEM RESET ERROR]:', err, stderr);
        return error(res, 'Falha ao repor dados de demonstração: ' + err.message, 500);
      }
      return success(res, { executed: true }, 'Base de dados e dados de demonstração foram restaurados com sucesso.');
    });
  } catch (err) {
    console.error('[SYSTEM CONTROLLER ERROR]:', err);
    return error(res, 'Erro interno ao processar restauro do sistema.', 500);
  }
}

module.exports = {
  resetDemoData
};

