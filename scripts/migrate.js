/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    const value = line.slice(equalsIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function runMigration() {
  const root = path.resolve(__dirname, "..");
  loadEnvFile(path.join(root, ".env.local"));
  loadEnvFile(path.join(root, ".env"));

  const host = process.env.DB_HOST ?? "localhost";
  const port = Number(process.env.DB_PORT ?? 3306);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME ?? "trinity_college";

  if (!user) {
    throw new Error("DB_USER is not set. Configure it in .env.local or .env.");
  }

  const schemaPath = path.join(root, "sql", "schema.sql");
  const schemaSQL = fs.readFileSync(schemaPath, "utf8");

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
  });

  try {
    await connection.query(schemaSQL);
    console.log("Migration completed: schema.sql applied successfully.");
  } finally {
    await connection.end();
  }
}

runMigration().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
