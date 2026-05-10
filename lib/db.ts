// src/lib/db.ts
import mysql from "mysql2/promise";

const globalPool = global as typeof globalThis & { _mysqlPool?: mysql.Pool };

function getPool(): mysql.Pool {
  if (!globalPool._mysqlPool) {
    globalPool._mysqlPool = mysql.createPool({
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: "+00:00",
      decimalNumbers: true,
    });
  }
  return globalPool._mysqlPool;
}

export const pool = getPool();

/** Run a parameterised query and return typed rows. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: mysql.ExecuteValues | unknown[]
): Promise<T[]> {
  const [rows] = await pool.execute(
    sql,
    params as mysql.ExecuteValues | undefined
  );
  return rows as T[];
}

/** Run a write query and return OkPacket info. */
export async function execute(
  sql: string,
  params?: mysql.ExecuteValues | unknown[]
): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute(
    sql,
    params as mysql.ExecuteValues | undefined
  );
  return result as mysql.ResultSetHeader;
}

/** Paginate helper */
export function paginateQuery(
  baseSQL: string,
  page: number,
  limit: number
): string {
  const offset = (page - 1) * limit;
  return `${baseSQL} LIMIT ${limit} OFFSET ${offset}`;
}
