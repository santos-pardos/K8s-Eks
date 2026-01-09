-- Script de inicialización para PostgreSQL.
-- Se ejecuta automáticamente al crear el volumen por primera vez.

CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    -- Prioridad de la tarea (baja, media, alta)
    priority TEXT DEFAULT 'media',
    -- Estado de archivado
    archived BOOLEAN DEFAULT false,
    -- Fecha de creación con zona horaria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Fecha de finalización (null si no está completada)
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Inserción de datos de ejemplo relacionados con Docker (Fechas actualizadas)
INSERT INTO todos (task, priority, created_at) 
VALUES ('Optimizar Dockerfile del backend', 'alta', '2025-10-20 09:00:00+00');

INSERT INTO todos (task, completed, priority, created_at, completed_at) 
VALUES ('Configurar volumen persistente para DB', true, 'media', '2025-10-22 11:30:00+00', '2025-10-24 16:00:00+00');

INSERT INTO todos (task, priority, created_at, archived) 
VALUES ('Investigar sobre redes bridge en Docker', 'baja', '2025-10-25 08:15:00+00', true);

INSERT INTO todos (task, priority, created_at) 
VALUES ('Documentar configuración de Nginx', 'media', '2025-10-26 14:00:00+00');
