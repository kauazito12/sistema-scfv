const { Pool } = require("pg");

const db = new Pool({
  user: "postgres.zayofjymnzlxeznuyzis",
  host: "aws-1-sa-east-1.pooler.supabase.com",
  database: "postgres",
  password: "scfvkaua1213",
  port: 6543,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = db;