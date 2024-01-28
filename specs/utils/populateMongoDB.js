const MongoClient = require('mongodb').MongoClient;
const data = require('../../server/data.json');

const url = 'mongodb://localhost:27017';
const dbName = 'WebApi';

async function populateDatabase() {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);
        // Delete existing data from the database
        await db.collection('posts').deleteMany({});
        await db.collection('albums').deleteMany({});
        await db.collection('comments').deleteMany({});
        await db.collection('photos').deleteMany({});
        await db.collection('todos').deleteMany({});
        await db.collection('users').deleteMany({});

        // Insert new data into the database
        const postsData = data.posts;
        const albumsData = data.albums;
        const commentsData = data.comments;
        const photosData = data.photos;
        const todosData = data.todos;
        const usersData = data.users;

        await db.collection('posts').insertMany(postsData);
        await db.collection('albums').insertMany(albumsData);
        await db.collection('comments').insertMany(data.comments);
        await db.collection('photos').insertMany(data.photos);
        await db.collection('todos').insertMany(data.todos);
        await db.collection('users').insertMany(data.users);

        console.log('Data inserted successfully!');
    } finally {
        await client.close();
    }
}
module.exports = populateDatabase;
// populateDatabase();
