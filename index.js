const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;

console.log(process.env)

// middleware
app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b6ihxc4.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.get("/", (req, res) => {
  res.send("PayConnect Server is running");
});

async function run() {
  try {
    await client.connect();
    const database = client.db("pay-connect-db");
    const billsCollection = database.collection("bills");

    // get all bills
    app.get('/bills', async(req, res)=>{
        const result = await billsCollection.find().toArray();
        res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "-----------------------Pinged your deployment. You successfully connected to MongoDB!-------------------"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`PayConnect Server listening on prot ${port}`);
});
