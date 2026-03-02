const express = require("express");
const cors = require("cors");
require("dotenv").config();
const listingsRoutes = require("./listings.routes");
const { verifyConnection } = require("./neo4j");
const authRoutes = require("./auth.routes");

const app = express();

// Allow both Live Server origins (sometimes it uses localhost, sometimes 127.0.0.1)
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman/curl) + allowed browser origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS blocked: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/listings", listingsRoutes);
app.get("/", (req, res) => res.send("Pete's Plaza API running"));

const PORT = Number(process.env.PORT) || 3001;

// Bind to 0.0.0.0 to avoid weird Windows/localhost edge cases
app.listen(PORT, "0.0.0.0", async () => {
  try {
    await verifyConnection();
    console.log("✅ Neo4j connection verified");
  } catch (err) {
    console.error("❌ Neo4j verifyConnection failed:", err.message);
    // NOTE: We do NOT crash the server here — API can still run.
  }
  console.log(`🚀 API running on http://127.0.0.1:${PORT}`);
});
