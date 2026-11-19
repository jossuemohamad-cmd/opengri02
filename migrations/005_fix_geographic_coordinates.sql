-- ==============================================================================
-- LECASU GridOps - Migração 005: Correção de Coordenadas Geográficas Onshore
-- Corrige coordenadas para garantir que todas as centrais e clientes fiquem em terra firme
-- nos povoados e distritos reais de Moçambique (sem pontos no mar ou canais).
-- ==============================================================================

-- 1. Atualizar Coordenadas das Mini-Redes para Localizações Terrestres Reais
UPDATE mini_grids 
SET latitude = -23.66500000, longitude = 35.31800000, localidade = 'Morrumbene Sede'
WHERE codigo = 'MR-INH-001';

UPDATE mini_grids 
SET latitude = -19.61200000, longitude = 34.74300000, localidade = 'Savane'
WHERE codigo = 'MR-SOF-001';

UPDATE mini_grids 
SET latitude = -14.95800000, longitude = 38.30500000, localidade = 'Iapala'
WHERE codigo = 'MR-NPL-001';

UPDATE mini_grids 
SET latitude = -13.00400000, longitude = 40.32500000, localidade = 'Mieze'
WHERE codigo = 'MR-CDG-001';

UPDATE mini_grids 
SET latitude = -25.46500000, longitude = 32.85500000, localidade = 'Calanga'
WHERE codigo = 'MR-MPT-001';

UPDATE mini_grids 
SET latitude = -25.40500000, longitude = 32.85200000, localidade = 'Maluana Sede'
WHERE codigo = 'MR-MPT-002';

UPDATE mini_grids 
SET latitude = -24.68500000, longitude = 33.53000000, localidade = 'Muembene'
WHERE codigo = 'MR-GZA-001';

UPDATE mini_grids 
SET latitude = -24.95200000, longitude = 33.12500000, localidade = 'Mazivila'
WHERE codigo = 'MR-GZA-002';

-- 2. Atualizar Clientes da Central MR-MPT-001 (Calanga, Maputo)
UPDATE clients SET latitude = -25.46450000, longitude = 32.85450000 WHERE codigo = 'MR001-RES-0001';
UPDATE clients SET latitude = -25.46550000, longitude = 32.85580000 WHERE codigo = 'MR001-RES-0002';
UPDATE clients SET latitude = -25.46400000, longitude = 32.85600000 WHERE codigo = 'MR001-PUE-0001';
UPDATE clients SET latitude = -25.46600000, longitude = 32.85400000 WHERE codigo = 'MR001-PUB-0001';
UPDATE clients SET latitude = -25.46520000, longitude = 32.85650000 WHERE codigo = 'MR001-COM-0001';
UPDATE clients SET latitude = -25.46350000, longitude = 32.85480000 WHERE codigo = 'MR001-TEL-0001';

-- 3. Atualizar Clientes da Central MR-MPT-002 (Maluana, Maputo)
UPDATE clients SET latitude = -25.40550000, longitude = 32.85250000 WHERE codigo = 'MR002-RES-0001';
UPDATE clients SET latitude = -25.40600000, longitude = 32.85150000 WHERE codigo = 'MR002-RES-0002';
UPDATE clients SET latitude = -25.40450000, longitude = 32.85300000 WHERE codigo = 'MR002-PUE-0001';
UPDATE clients SET latitude = -25.40400000, longitude = 32.85100000 WHERE codigo = 'MR002-PUB-0001';

-- 4. Atualizar Clientes da Central MR-GZA-001 (Muembene, Gaza)
UPDATE clients SET latitude = -24.68550000, longitude = 33.53050000 WHERE codigo = 'MR003-RES-0001';
UPDATE clients SET latitude = -24.68600000, longitude = 33.52950000 WHERE codigo = 'MR003-RES-0002';
UPDATE clients SET latitude = -24.68450000, longitude = 33.53100000 WHERE codigo = 'MR003-PUE-0001';

-- 5. Atualizar Clientes da Central MR-GZA-002 (Mazivila, Gaza)
UPDATE clients SET latitude = -24.95150000, longitude = 33.12550000 WHERE codigo = 'MR004-RES-0001';
UPDATE clients SET latitude = -24.95250000, longitude = 33.12450000 WHERE codigo = 'MR004-COM-0001';

-- 6. Atualizar Clientes da Central MR-INH-001 (Morrumbene, Inhambane)
UPDATE clients SET latitude = -23.66450000, longitude = 35.31750000 WHERE codigo = 'MR005-PUE-0001';
UPDATE clients SET latitude = -23.66550000, longitude = 35.31850000 WHERE codigo = 'MR005-PUB-0001';
UPDATE clients SET latitude = -23.66400000, longitude = 35.31900000 WHERE codigo = 'MR005-COM-0001';
UPDATE clients SET latitude = -23.66600000, longitude = 35.31700000 WHERE codigo = 'MR005-RES-0001';

-- 7. Atualizar Clientes da Central MR-SOF-001 (Dondo, Sofala)
UPDATE clients SET latitude = -19.61150000, longitude = 34.74250000 WHERE codigo = 'MR006-PUE-0001';
UPDATE clients SET latitude = -19.61250000, longitude = 34.74350000 WHERE codigo = 'MR006-PUE-0002';
UPDATE clients SET latitude = -19.61100000, longitude = 34.74400000 WHERE codigo = 'MR006-PUB-0001';
UPDATE clients SET latitude = -19.61300000, longitude = 34.74200000 WHERE codigo = 'MR006-RES-0001';

-- 8. Atualizar Clientes da Central MR-NPL-001 (Ribáuè, Nampula)
UPDATE clients SET latitude = -14.95750000, longitude = 38.30450000 WHERE codigo = 'MR007-PUE-0001';
UPDATE clients SET latitude = -14.95850000, longitude = 38.30550000 WHERE codigo = 'MR007-COM-0001';
UPDATE clients SET latitude = -14.95700000, longitude = 38.30600000 WHERE codigo = 'MR007-PUB-0001';
UPDATE clients SET latitude = -14.95900000, longitude = 38.30400000 WHERE codigo = 'MR007-RES-0001';

-- 9. Atualizar Clientes da Central MR-CDG-001 (Metuge, Cabo Delgado)
UPDATE clients SET latitude = -13.00350000, longitude = 40.32550000 WHERE codigo = 'MR008-PUE-0001';
UPDATE clients SET latitude = -13.00450000, longitude = 40.32450000 WHERE codigo = 'MR008-PUB-0001';
UPDATE clients SET latitude = -13.00420000, longitude = 40.32600000 WHERE codigo = 'MR008-RES-0001';
