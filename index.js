import { MongoClient } from 'mongodb';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { geographicalDistribution } from './Controllers/gd.js';
import { salesOverTime } from './Controllers/sot.js';
import { salesGrowth } from './Controllers/sg.js';
import { newCustomers } from './Controllers/ncot.js';
import { repeatedCustomers } from './Controllers/rc.js';
import { customerLifeTime } from './Controllers/cltv.js';


const app = express();
const Port = process.env.PORT;


// MongoDB connection string
const uri = process.env.MongoUrl;

// Middleware
app.use(cors())
app.use(express.json());

// Database connection
let client;
let db;
let collections;

async function connectToMongoDB() {
  client = new MongoClient(uri);
  await client.connect();
  db = client.db('RQ_Analytics');
  collections = await db.listCollections().toArray();
}

app.get("/salesovertime", salesOverTime);

app.get("/salesgrowthrate",salesGrowth);

app.get("/newcustomers",newCustomers);

app.get('/repeatcustomers', repeatedCustomers);

app.get('/geographicaldistribution', geographicalDistribution);

app.get('/cltvcohorts',customerLifeTime);


app.listen(Port, async () => {
  try {
    await connectToMongoDB(); 
    console.log(`Listening on port ${Port}`);
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
});
export { collections,db}
