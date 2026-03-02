require("dotenv").config();
const { driver } = require("./neo4j");

async function seedDatabase() {
  const session = driver.session({ database: process.env.NEO4J_DB });

  try {
    console.log("🌱 Seeding database...");

    // 1) Categories (run each as a separate statement)
    const categories = [
      "T-Shirts",
      "Jeans",
      "Sweatshirts",
      "Shoes",
      "Appliances",
      "Furniture",
      "Accessories",
    ];

    for (const name of categories) {
      await session.run(
        "MERGE (:Category {name: $name})",
        { name }
      );
    }

    // 2) Demo user
    await session.run(
      `
      MERGE (u:User {username: $username})
      ON CREATE SET u.createdAt = datetime()
      `,
      { username: "matthew" }
    );

    // 3) Demo listing #1 (T-Shirts)
    await session.run(
      `
      MATCH (u:User {username: $username})
      MATCH (c:Category {name: $category})
      CREATE (l:Listing {
        listingId: randomUUID(),
        name: $name,
        price: toFloat($price),
        description: $description,
        createdAt: datetime()
      })
      MERGE (u)-[:CREATED]->(l)
      MERGE (l)-[:IN_CATEGORY]->(c)
      `,
      {
        username: "matthew",
        category: "T-Shirts",
        name: "Graphic T-Shirt",
        price: 12.99,
        description: "Soft cotton tee with logo print",
      }
    );

    // 4) Demo listing #2 (Shoes)
    await session.run(
      `
      MATCH (u:User {username: $username})
      MATCH (c:Category {name: $category})
      CREATE (l:Listing {
        listingId: randomUUID(),
        name: $name,
        price: toFloat($price),
        description: $description,
        createdAt: datetime()
      })
      MERGE (u)-[:CREATED]->(l)
      MERGE (l)-[:IN_CATEGORY]->(c)
      `,
      {
        username: "matthew",
        category: "Shoes",
        name: "Running Shoes",
        price: 45.0,
        description: "Lightweight running shoes",
      }
    );

    console.log("✅ Database seeded successfully!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedDatabase();
