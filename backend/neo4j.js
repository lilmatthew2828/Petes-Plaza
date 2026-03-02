require("dotenv").config();
const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASS)
);

async function verifyConnection() {
  const session = driver.session({ database: process.env.NEO4J_DB });
  try {
    await session.run("RETURN 1");
    console.log("✅ Connected to Neo4j Aura database");
  } finally {
    await session.close();
  }
}

module.exports = { driver, verifyConnection };
