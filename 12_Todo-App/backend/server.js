const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

/**
 * Configuración del pool de conexiones de PostgreSQL.
 * Lee las variables de entorno automáticamente (PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT)
 * que son proporcionadas por el archivo .env en docker-compose.
 */
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

/**
 * Endpoint: GET /api/todos
 * Obtiene todas las tareas (activas y archivadas).
 * El frontend se encarga de filtrar.
 */
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener tareas:', err.message, err.stack);
    res.status(500).json({ error: 'Error en vista actual: Internal Server Error' });
  }
});

/**
 * Endpoint: POST /api/todos
 * Crea una nueva tarea.
 */
app.post('/api/todos', async (req, res) => {
  try {
    const { task, priority } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'El campo "task" es requerido' });
    }
    const newTask = await pool.query(
      'INSERT INTO todos (task, priority) VALUES ($1, $2) RETURNING *',
      [task, priority || 'media']
    );
    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    console.error('Error al crear tarea:', err.message, err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Endpoint: PUT /api/todos/:id
 * Actualiza una tarea (completar, archivar, o editar texto/prioridad).
 */
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, archived, task, priority } = req.body;

    let query;
    let values;

    if (completed !== undefined) {
      // Lógica para completar/descompletar
      const completedAt = completed ? 'CURRENT_TIMESTAMP' : null;
      query = `UPDATE todos SET completed = $1, completed_at = ${completedAt} WHERE id = $2 RETURNING *`;
      values = [completed, id];
    } else if (archived !== undefined) {
      // Lógica para archivar/restaurar
      query = 'UPDATE todos SET archived = $1 WHERE id = $2 RETURNING *';
      values = [archived, id];
    } else if (task !== undefined && priority !== undefined) {
      // Lógica para editar texto y prioridad
      query = 'UPDATE todos SET task = $1, priority = $2 WHERE id = $3 RETURNING *';
      values = [task, priority, id];
    } else {
      return res.status(400).json({ error: 'Cuerpo de solicitud inválido' });
    }

    const updateTodo = await pool.query(query, values);

    if (updateTodo.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(updateTodo.rows[0]);

  } catch (err) {
    console.error('Error al actualizar tarea:', err.message, err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Endpoint: DELETE /api/todos/:id
 * Elimina una tarea permanentemente.
 */
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    if (deleteTodo.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    console.error('Error al eliminar tarea:', err.message, err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
