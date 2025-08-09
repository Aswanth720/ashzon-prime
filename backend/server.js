// backend/server.js

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI; 
const dbName = 'ashzonPrimeDB';

let db;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
async function connectToMongo() {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);

    await populateInitialContentMongo();

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Populate initial data in MongoDB if collections are empty
async function populateInitialContentMongo() {
  const contentCollection = db.collection('content');
  const existingContentCount = await contentCollection.countDocuments();
  if (existingContentCount === 0) {
    console.log("Populating initial content in MongoDB...");
    const initialContent = [
      { contentId: "the-boys-series", title: "The Boys", type: "series", genre: ["Superhero Satire", "Action", "Comedy"], imageUrl: "https://oyster.ignimgs.com/wordpress/stg.ign.com/2020/08/Homelander-Clean.jpg", description: "A dark, satirical superhero series.", language: ["English"], releaseYear: 2019, videoUrl: "https://www.youtube.com/watch?v=5D_fU0s1468" },
      { contentId: "reacher-series", title: "Reacher", type: "series", genre: ["Action", "Thriller"], imageUrl: "https://resizing.flixster.com/Q4ZEIAczaoZAaxivmrwDE_Inxco=/ems.cHJkLWVtcy1hc3NldHMvdHZzZWFzb24vMWQ3Zjk0ZDAtZDcyNC00YjI2LThlZTMtYmJkMTFkMzZiNWFkLmpwZw==", description: "An action-crime series based on Lee Child's novels.", language: ["English"], releaseYear: 2022, videoUrl: "https://www.youtube.com/watch?v=GSb0bixhE1M" },
      { contentId: "rings-of-power-series", title: "Rings of Power", type: "series", genre: ["Fantasy", "Adventure"], imageUrl: "https://bazaarvietnam.vn/wp-content/uploads/2022/09/harper-bazaar-review-the-lord-of-the-rings-the-rings-of-power-2-e1662283735938.png", description: "A grand fantasy epic set in Middle-earth.", language: ["English"], releaseYear: 2022, videoUrl: "https://www.youtube.com/watch?v=x8UFIl7R0mQ" },
      { contentId: "summer-i-turned-pretty", title: "Summer I Turned Pretty", type: "series", genre: ["Romantic Drama", "Coming-of-age"], imageUrl: "https://cdn.seat42f.com/wp-content/uploads/2023/07/02200337/The-Summer-I-Turned-Pretty-Season-2-Poster-Key-Art.jpg", description: "A popular young adult romantic drama.", language: ["English"], releaseYear: 2022, videoUrl: "https://www.youtube.com/watch?v=F0SjGfJd9gA" },
      { contentId: "spider-man-far-from-home", title: "Spider-Man: Far From Home", type: "movie", genre: ["Superhero", "Action", "Sci-Fi"], imageUrl: "https://www.sonypictures.co.uk/sites/unitedkingdom/files/2021-09/DP_4710017_TC_1400x2100_DP_4710018_SpiderManFarFromHome_2019_ITUNES_2000x3000_UK_1333x2000_thumbnail.jpg", description: "A fun and action-packed Spider-Man movie.", language: ["English", "Tamil"], releaseYear: 2019, videoUrl: "https://www.youtube.com/watch?v=DYYt6q24t2s" },
      { contentId: "interstellar-movie", title: "Interstellar", type: "movie", genre: ["Sci-Fi", "Drama"], imageUrl: "https://i.pinimg.com/originals/8e/0d/ab/8e0dab8699be85720ce55845065bf6dc.jpg", description: "Christopher Nolan's acclaimed sci-fi epic.", language: ["English", "Tamil"], releaseYear: 2014, videoUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E" },
      { contentId: "the-dark-knight-movie", title: "The Dark Knight", type: "movie", genre: ["Action", "Crime", "Thriller"], imageUrl: "https://m.media-amazon.com/images/I/91KkWf50SoL._AC_SL1500_.jpg", description: "The critically acclaimed Batman film.", language: ["English", "Tamil"], releaseYear: 2008, videoUrl: "https://www.youtube.com/watch?v=EXeK8d58r7g" }
    ];
    await contentCollection.insertMany(initialContent);
    console.log("Initial content populated in MongoDB.");
  }
  const watchHistoryCollection = db.collection('watchHistory');
  const existingWatchHistoryCount = await watchHistoryCollection.countDocuments();
  if (existingWatchHistoryCount === 0) {
    await watchHistoryCollection.insertMany([
      { userId: "demo_user_1", contentId: "the-boys-series", progressSeconds: 1500, totalSeconds: 2400, lastWatchedTimestamp: new Date().toISOString() },
      { userId: "demo_user_1", contentId: "interstellar-movie", progressSeconds: 3600, totalSeconds: 10620, lastWatchedTimestamp: new Date().toISOString() },
      { userId: "demo_user_1", contentId: "reacher-series", progressSeconds: 1200, totalSeconds: 2700, lastWatchedTimestamp: new Date().toISOString() }
    ]);
    console.log("Initial watch history populated in MongoDB.");
  }
}

// API Endpoints
app.get('/api/content', async (req, res) => {
  try {
    const content = await db.collection('content').find({}).toArray();
    res.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ message: "Error fetching content" });
  }
});

app.get('/api/content/:contentId', async (req, res) => {
    const contentId = req.params.contentId;
    try {
        const content = await db.collection('content').findOne({ contentId: contentId });
        if (content) {
            res.json(content);
        } else {
            res.status(404).json({ message: "Content not found" });
        }
    } catch (error) {
        console.error(`Error fetching content for ID ${contentId}:`, error);
        res.status(500).json({ message: "Error fetching content" });
    }
});


app.get('/api/users/:userId/continueWatching', async (req, res) => {
  const userId = req.params.userId;
  try {
    const watchHistoryItems = await db.collection('watchHistory').find({ userId: userId }).toArray();
    res.json(watchHistoryItems);
  } catch (error) {
    console.error(`Error fetching watch history for user ${userId}:`, error);
    res.status(500).json({ message: "Error fetching watch history" });
  }
});

app.post('/api/users/:userId/watchProgress', async (req, res) => {
  const userId = req.params.userId;
  const { contentId, progressSeconds, totalSeconds } = req.body;

  try {
    await db.collection('watchHistory').updateOne(
      { userId: userId, contentId: contentId },
      { $set: { progressSeconds: progressSeconds, totalSeconds: totalSeconds, lastWatchedTimestamp: new Date().toISOString() } },
      { upsert: true }
    );
    res.status(200).json({ message: "Watch progress updated" });
  } catch (error) {
    console.error(`Error updating watch progress for user ${userId}:`, error);
    res.status(500).json({ message: "Error updating watch progress" });
  }
});

connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
  });
});