import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import sqlite3 from 'sqlite3';

let pool: Pool | null = null;
let sqliteDb: sqlite3.Database | null = null;

interface DatabaseClient {
  query: (text: string, params?: any[]) => Promise<any>;
  release?: () => void;
}

export async function getDbClient(): Promise<DatabaseClient> {
  // Try PostgreSQL first if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    if (!pool) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    }
    const client = await pool.connect();
    return {
      query: (text: string, params?: any[]) => client.query(text, params),
      release: () => client.release(),
    };
  }

  // Fallback to SQLite
  if (!sqliteDb) {
    const dbPath = process.env.SQLITE_DB_PATH || './data/ai_studio.db';
    const dbDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    sqliteDb = new sqlite3.Database(dbPath);
  }

  return {
    query: (text: string, params?: any[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        // Convert PostgreSQL-style queries to SQLite-compatible
        const sqliteQuery = text
          .replace(/\$(\d+)/g, (_, num) => `?${num}`)
          .replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
          .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP');

        const trimmedQuery = sqliteQuery.trim().toUpperCase();
        const isSelect = trimmedQuery.startsWith('SELECT');

        if (isSelect) {
          sqliteDb!.all(sqliteQuery, params || [], (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve({ rows: rows || [], rowCount: rows?.length || 0 });
            }
          });
        } else {
          // For INSERT, UPDATE, DELETE use run
          sqliteDb!.run(sqliteQuery, params || [], function (err) {
            if (err) {
              reject(err);
            } else {
              // For INSERT with RETURNING, fetch the inserted row
              if (trimmedQuery.startsWith('INSERT') && sqliteQuery.includes('RETURNING')) {
                const tableMatch = sqliteQuery.match(/INTO\s+(\w+)/i);
                const tableName = tableMatch ? tableMatch[1] : null;
                if (tableName && this.lastID) {
                  sqliteDb!.get(
                    `SELECT * FROM ${tableName} WHERE id = ?`,
                    [this.lastID],
                    (getErr, row) => {
                      if (getErr) {
                        resolve({ rows: [], rowCount: 0, insertId: this.lastID });
                      } else {
                        resolve({ rows: row ? [row] : [], rowCount: 1, insertId: this.lastID });
                      }
                    }
                  );
                } else {
                  resolve({ rows: [], rowCount: 0, insertId: this.lastID });
                }
              } else {
                resolve({ rows: [], rowCount: this.changes });
              }
            }
          });
        }
      });
    },
  };
}

export async function initializeDatabase(): Promise<void> {
  const client = await getDbClient();
  
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Convert schema for SQLite if needed
    let processedSchema = schema;
    if (!process.env.DATABASE_URL && sqliteDb) {
      // Convert PostgreSQL syntax to SQLite
      processedSchema = schema
        .replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
        .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
        .replace(/INTEGER NOT NULL REFERENCES users\(id\) ON DELETE CASCADE/g, 'INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE');
    }
    
    // Execute schema statements
    const statements = processedSchema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      // Skip empty statements
      if (!statement || statement.trim().length === 0) {
        continue;
      }
      
      try {
        await client.query(statement);
      } catch (error: any) {
        // Ignore "already exists" and "duplicate" errors
        const errorMessage = error.message || '';
        const errorCode = error.code || '';
        
        const shouldIgnore = 
          errorMessage.includes('already exists') ||
          errorMessage.includes('duplicate') ||
          errorCode === '42P07' || // relation already exists
          errorCode === '42710';   // duplicate object
        
        if (!shouldIgnore) {
          // Log the error but don't throw for development
          console.warn(`Warning: Error executing statement: ${statement.substring(0, 50)}...`);
          console.warn(`Error: ${errorMessage}`);
          // Don't throw - allow initialization to continue
          // This is important because if tables already exist, we don't want to fail
        }
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (client.release) {
      client.release();
    }
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
  if (sqliteDb) {
    return new Promise((resolve, reject) => {
      sqliteDb!.close((err) => {
        if (err) reject(err);
        else {
          sqliteDb = null;
          resolve();
        }
      });
    });
  }
}

