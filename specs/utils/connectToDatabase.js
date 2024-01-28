// connectToDatabase.js

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'WebApi';

async function connectToDatabase() {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Succesfully connected to the MongoDB database.');

        return client.db(dbName);
    } catch (error) {
        console.error('Error connecting to the MongoDB database:', error);
        throw error;
    }
}

module.exports = connectToDatabase;

