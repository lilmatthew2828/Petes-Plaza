const express = require("express");
const router = express.Router();
const { driver } = require("./neo4j");

// GET wishlist for a user
router.get("/:username", async (req, res) => 
{
  const { username } = req.params;
  const session = driver.session({ database: process.env.NEO4J_DB });

  try 
  {
    const result = await session.run(
      `
      MATCH (u:User {username: $username})-[:WISHLISTED]->(l:Listing)
      RETURN l
      ORDER BY l.title
      `,
      { username }
    );

    const items = result.records.map(r => r.get("l").properties);
    res.json({ ok: true, items });
  } 
  catch (err) 
  {
    console.error(err);
    res.status(500).json({ ok: false, message: "Failed to fetch wishlist" });
  } 
  finally 
  {
    await session.close();
  }
});

// POST add item to wishlist
router.post("/add", async (req, res) =>
{
  const { username, listingId } = req.body;
  const session = driver.session({ database: process.env.NEO4J_DB });

  try 
  {
    await session.run(
      `
      MATCH (u:User {username: $username})
      MATCH (l:Listing {id: $listingId})
      MERGE (u)-[:WISHLISTED]->(l)
      `,
      { username, listingId }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Failed to add wishlist item" });
  } finally {
    await session.close();
  }
});

// POST remove item from wishlist
router.post("/remove", async (req, res) => {
  const { username, listingId } = req.body;
  const session = driver.session({ database: process.env.NEO4J_DB });

  try {
    await session.run(
      `
      MATCH (u:User {username: $username})-[r:WISHLISTED]->(l:Listing {id: $listingId})
      DELETE r
      `,
      { username, listingId }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Failed to remove wishlist item" });
  } finally {
    await session.close();
  }
});

module.exports = router;