// listings.routes.js

// Neo4j integration
const neo4j = require('neo4j-driver');

const driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('username', 'password'));
const session = driver.session();

const express = require('express');
const router = express.Router();

router.get('/listings', async (req, res) => {
    try {
        const result = await session.run('MATCH (l:Listing) RETURN l');
        const listings = result.records.map(record => record.get('l').properties);
        res.json(listings);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving listings');
    }
});

module.exports = router;