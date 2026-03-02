const express = require("express");
const router = express.Router();
const { driver } = require("./neo4j");

// GET /listings  OR  /listings?category=Shoes
router.get("/", async (req, res) => {
  const session = driver.session({ database: process.env.NEO4J_DB });

  try {
    const { category } = req.query;

    const cypher = category
      ? `
        MATCH (l:Listing {category: $category})
        RETURN l { .listingId, .title, .price, .category } AS listing
        ORDER BY l.title
      `
      : `
        MATCH (l:Listing)
        RETURN l { .listingId, .title, .price, .category } AS listing
        ORDER BY l.title
      `;

    const params = category ? { category } : {};
    const result = await session.run(cypher, params);

    const listings = result.records.map((r) => r.get("listing"));
    res.json(listings);
  } catch (err) {
    console.error("❌ /listings error:", err);
    res.status(500).json({ error: "Failed to fetch listings" });
  } finally {
    await session.close();
  }
});

module.exports = router;