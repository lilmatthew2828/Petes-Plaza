// listings.routes.js
const express = require("express");
const router = express.Router();
const { driver } = require("./neo4j");

//  Create or update a Listing + connect it to a User
// POST /listings
router.post("/", async (req, res) => {
  const session = driver.session({ database: process.env.NEO4J_DB });

  try {
    const { userId, listingId, title, price, category, image } = req.body;

    // Validate
    if (!userId || !listingId || !title || price === undefined || !category) {
      return res.status(400).json({
        error: "userId, listingId, title, price, category are required",
      });
    }

    const cypher = `
      MATCH (u:User {userId: $userId})
      MERGE (l:Listing {listingId: $listingId})
      SET l.title = $title,
          l.price = toFloat($price),
          l.category = $category,
          l.image = coalesce($image, ""),
          l.createdAt = coalesce(l.createdAt, datetime())
      MERGE (u)-[:POSTED]->(l)
      RETURN l { .listingId, .title, .price, .category, .image, .createdAt } AS listing
    `;

    const result = await session.run(cypher, {
      userId,
      listingId,
      title,
      price,
      category,
      image: image || "",
    });

    // If user not found, query returns no records
    if (result.records.length === 0) {
      return res.status(404).json({ error: "User not found (bad userId)" });
    }

    const listing = result.records[0].get("listing");
    return res.status(201).json({ ok: true, listing });
  } catch (err) {
    console.error("❌ POST /listings error:", err);
    return res.status(500).json({ error: "Failed to create listing" });
  } finally {
    await session.close();
  }
});

//  Get all listings (optionally filtered by category)
// GET /listings?category=Shoes
router.get("/", async (req, res) => {
  const session = driver.session({ database: process.env.NEO4J_DB });

  try {
    const { category } = req.query;

    const cypher = category
      ? `
        MATCH (u:User)-[:POSTED]->(l:Listing {category: $category})
        RETURN l { .listingId, .title, .price, .category, .image } AS listing,
               u.username AS postedBy
        ORDER BY l.title
      `
      : `
        MATCH (u:User)-[:POSTED]->(l:Listing)
        RETURN l { .listingId, .title, .price, .category, .image } AS listing,
               u.username AS postedBy
        ORDER BY l.title
      `;

    const result = await session.run(cypher, category ? { category } : {});
    const listings = result.records.map((r) => ({
      ...r.get("listing"),
      postedBy: r.get("postedBy"),
    }));

    return res.json(listings);
  } catch (err) {
    console.error("❌ GET /listings error:", err);
    return res.status(500).json({ error: "Failed to fetch listings" });
  } finally {
    await session.close();
  }
});

// Delete a listing
// DELETE /listings/:listingId
router.delete("/:listingId", async (req, res) => {
  const session = driver.session({ database: process.env.NEO4J_DB });

  try {
    const { listingId } = req.params;

    const cypher = `
      MATCH (l:Listing {listingId: $listingId})
      DETACH DELETE l
      RETURN $listingId AS deleted
    `;

    const result = await session.run(cypher, { listingId });
    const deleted = result.records.length > 0;

    return res.json({ ok: true, deleted, listingId });
  } catch (err) {
    console.error("❌ DELETE /listings/:listingId error:", err);
    return res.status(500).json({ error: "Failed to delete listing" });
  } finally {
    await session.close();
  }
});

module.exports = router;