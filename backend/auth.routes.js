const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { driver } = require("./neo4j");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// POST /auth/signup
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing username/email/password." });
  }

  const session = driver.session({ database: process.env.NEO4J_DB });

  try {
    // check if username or email already exists
    const existing = await session.run(
      `
      MATCH (u:User)
      WHERE u.username = $username OR u.email = $email
      RETURN u LIMIT 1
      `,
      { username, email }
    );

    if (existing.records.length > 0) {
      return res.status(409).json({ error: "Username or email already in use." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await session.run(
      `
      CREATE (u:User {
        userId: randomUUID(),
        username: $username,
        email: $email,
        passwordHash: $passwordHash,
        createdAt: datetime()
      })
      RETURN u { .userId, .username, .email } AS user
      `,
      { username, email, passwordHash }
    );

    const user = result.records[0].get("user");

    const token = jwt.sign(
      { userId: user.userId, username: user.username },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(201).json({ user, token });
  } 
  catch (err)
   {
      console.error("Signup error:", err);
      return res.status(500).json({ error: "Server error during signup." });
  }
     finally 
  {
    await session.close();
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) 
  {
      return res.status(400).json({ error: "Missing username/password." });
  }

  const session = driver.session({ database: process.env.NEO4J_DB });

  try 
  {
    const result = await session.run(
      `
      MATCH (u:User { username: $username })
      RETURN u LIMIT 1
      `,
      { username }
    );

    if (result.records.length === 0) 
    {
        return res.status(401).json({ error: "Invalid username or password." });
    }

    const u = result.records[0].get("u").properties;

    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) 
    {
        return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = { userId: u.userId, username: u.username, email: u.email };

    const token = jwt.sign(
      { userId: user.userId, username: user.username },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({ user, token });
  } 
    catch (err) 
  {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login." });
  } 
    finally 
  {
    await session.close();
  }
});

module.exports = router;
