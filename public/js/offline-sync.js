/**
 * LECASU GridOps - Módulo de Sincronização Offline no Terreno (IndexedDB)
 * 
 * Permite que agentes comunitários e técnicos de campo cadastrem clientes,
 * registem leituras e abram/encerrem ordens de trabalho mesmo em zonas rurais
 * de Moçambique sem cobertura de rede GSM/Internet.
 */

const DB_NAME = 'GridOpsLocal';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Inicializa a base de dados local IndexedDB com as stores de contingência
 */
function initIndexedDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('[GridOps Offline] IndexedDB não é suportado neste navegador.');
      return resolve(null);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Fila de clientes cadastrados offline
      if (!db.objectStoreNames.contains('pending_customers')) {
        db.createObjectStore('pending_customers', { keyPath: 'local_id', autoIncrement: true });
      }

      // Fila de leituras registadas offline
      if (!db.objectStoreNames.contains('pending_readings')) {
        db.createObjectStore('pending_readings', { keyPath: 'local_id', autoIncrement: true });
      }

      // Fila de ordens de trabalho criadas ou encerradas offline
      if (!db.objectStoreNames.contains('pending_orders')) {
        db.createObjectStore('pending_orders', { keyPath: 'local_id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      console.log('[GridOps Offline] IndexedDB GridOpsLocal inicializada com sucesso.');
      updateOfflineIndicator();
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('[GridOps Offline] Erro ao abrir IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Guarda um cliente localmente quando a rede estiver indisponível
 */
async function saveOfflineCustomer(customerData) {
  if (!dbInstance) await initIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(['pending_customers'], 'readwrite');
    const store = tx.objectStore('pending_customers');
    const record = {
      ...customerData,
      _offline_timestamp: new Date().toISOString()
    };
    const req = store.add(record);
    req.onsuccess = () => {
      updateOfflineIndicator();
      resolve(req.result);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Guarda uma leitura localmente quando a rede estiver indisponível
 */
async function saveOfflineReading(readingData) {
  if (!dbInstance) await initIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(['pending_readings'], 'readwrite');
    const store = tx.objectStore('pending_readings');
    const record = {
      ...readingData,
      _offline_timestamp: new Date().toISOString()
    };
    const req = store.add(record);
    req.onsuccess = () => {
      updateOfflineIndicator();
      resolve(req.result);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Guarda uma ordem de trabalho localmente quando a rede estiver indisponível
 */
async function saveOfflineWorkOrder(orderData) {
  if (!dbInstance) await initIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(['pending_orders'], 'readwrite');
    const store = tx.objectStore('pending_orders');
    const record = {
      ...orderData,
      _offline_timestamp: new Date().toISOString()
    };
    const req = store.add(record);
    req.onsuccess = () => {
      updateOfflineIndicator();
      resolve(req.result);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Obtém todos os registos pendentes de uma store específica
 */
function getPendingRecords(storeName) {
  return new Promise((resolve, reject) => {
    if (!dbInstance) return resolve([]);
    const tx = dbInstance.transaction([storeName], 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Remove um registo processado da fila local
 */
function removePendingRecord(storeName, localId) {
  return new Promise((resolve, reject) => {
    if (!dbInstance) return resolve();
    const tx = dbInstance.transaction([storeName], 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(localId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Conta os registos totais acumulados em espera de sincronização
 */
async function getPendingCounts() {
  const customers = await getPendingRecords('pending_customers');
  const readings = await getPendingRecords('pending_readings');
  const orders = await getPendingRecords('pending_orders');
  return {
    customers: customers.length,
    readings: readings.length,
    orders: orders.length,
    total: customers.length + readings.length + orders.length
  };
}

/**
 * Atualiza o indicador visual de modo offline e pendências na barra superior
 */
async function updateOfflineIndicator() {
  const counts = await getPendingCounts();
  let banner = document.getElementById('offline-sync-banner');

  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'offline-sync-banner';
    banner.style.cssText = `
      display: none;
      background-color: var(--color-warning-subtle, #fff3cd);
      color: #856404;
      padding: 0.4rem 1rem;
      border-bottom: 1px solid #ffeeba;
      font-size: 0.8rem;
      text-align: center;
      font-weight: 500;
    `;
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.insertBefore(banner, appContainer.firstChild);
    }
  }

  const isOnline = navigator.onLine;

  if (!isOnline || counts.total > 0) {
    banner.style.display = 'block';
    if (!isOnline) {
      banner.innerHTML = `⚠️ <strong>Modo Offline Ativo:</strong> Sem ligação à internet no terreno. ${counts.total} registo(s) guardado(s) localmente aguardando sincronização.`;
    } else {
      banner.innerHTML = `🔄 <strong>Conexão Restabelecida:</strong> Existem ${counts.total} registo(s) locais pendentes. <button id="btn-manual-sync" class="btn" style="padding: 0.1rem 0.5rem; margin-left: 0.5rem; font-size: 0.75rem;">Sincronizar Agora</button>`;
      const btnSync = document.getElementById('btn-manual-sync');
      if (btnSync) {
        btnSync.onclick = () => syncPendingData();
      }
    }
  } else {
    banner.style.display = 'none';
  }
}

/**
 * Sincroniza todos os registos acumulados no IndexedDB com o backend
 */
async function syncPendingData() {
  const token = localStorage.getItem('lecasu_jwt_token');
  if (!token) {
    console.warn('[GridOps Offline] Sincronização adiada: utilizador não autenticado.');
    return;
  }

  if (!navigator.onLine) {
    console.warn('[GridOps Offline] Dispositivo continua offline.');
    return;
  }

  console.log('[GridOps Offline] A iniciar sincronização de dados de campo...');

  try {
    // 1. Sincroniza Clientes
    const pendingCustomers = await getPendingRecords('pending_customers');
    for (const cust of pendingCustomers) {
      try {
        const { local_id, _offline_timestamp, ...payload } = cust;
        const resp = await fetch('/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (resp.ok) {
          await removePendingRecord('pending_customers', local_id);
          console.log(`[GridOps Offline] Cliente sincronizado com sucesso: ${payload.nome_completo}`);
        }
      } catch (err) {
        console.error('[GridOps Offline] Erro ao sincronizar cliente:', err);
      }
    }

    // 2. Sincroniza Leituras
    const pendingReadings = await getPendingRecords('pending_readings');
    for (const read of pendingReadings) {
      try {
        const { local_id, _offline_timestamp, ...payload } = read;
        const resp = await fetch('/api/readings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (resp.ok) {
          await removePendingRecord('pending_readings', local_id);
          console.log(`[GridOps Offline] Leitura sincronizada com sucesso: ${payload.valor_kwh} kWh`);
        }
      } catch (err) {
        console.error('[GridOps Offline] Erro ao sincronizar leitura:', err);
      }
    }

    // 3. Sincroniza Ordens de Trabalho
    const pendingOrders = await getPendingRecords('pending_orders');
    for (const ord of pendingOrders) {
      try {
        const { local_id, _offline_timestamp, ...payload } = ord;
        const resp = await fetch('/api/work-orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (resp.ok) {
          await removePendingRecord('pending_orders', local_id);
          console.log(`[GridOps Offline] Ordem de trabalho sincronizada com sucesso: ${payload.descricao}`);
        }
      } catch (err) {
        console.error('[GridOps Offline] Erro ao sincronizar OT:', err);
      }
    }

    await updateOfflineIndicator();
    console.log('[GridOps Offline] Sincronização concluída com sucesso.');
  } catch (syncErr) {
    console.error('[GridOps Offline] Falha geral durante a sincronização:', syncErr);
  }
}

// Ouvintes para transição online/offline
window.addEventListener('online', () => {
  console.log('[GridOps Offline] Rede detetada (online).');
  updateOfflineIndicator();
  syncPendingData();
});

window.addEventListener('offline', () => {
  console.warn('[GridOps Offline] Ligação perdida (offline). A ativar contingência IndexedDB.');
  updateOfflineIndicator();
});

// Inicialização imediata
if (typeof window !== 'undefined') {
  window.GridOpsOffline = {
    init: initIndexedDB,
    saveCustomer: saveOfflineCustomer,
    saveReading: saveOfflineReading,
    saveWorkOrder: saveOfflineWorkOrder,
    getPendingCounts,
    sync: syncPendingData
  };
  initIndexedDB();
}

