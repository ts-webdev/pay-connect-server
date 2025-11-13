const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b6ihxc4.mongodb.net/?appName=Cluster0`;

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
    const myBillsCollection = database.collection("my-bills");

    // get all bills
    app.get("/bills", async (req, res) => {
      const { sort } = req.query;
      let query = {};
      if (sort === "All") {
        const result = await billsCollection.find().toArray();
        res.send(result);
        return;
      } else {
        const result = await billsCollection.find({ category: sort }).toArray();
        res.send(result);
      }
    });

    // get latest bills

    app.get("/bills/latest", async (req, res) => {
      const result = await billsCollection
        .find()
        .sort({ date: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // get a bill by id
    app.get("/bills/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await billsCollection.findOne(query);
      res.send(result);
    });

    // post my-bills
    app.post("/my-bills", async (req, res) => {
      const newData = req.body;
      const result = await myBillsCollection.insertOne(newData);
      res.send(result);
    });

    // get my-bills
    app.get("/my-bills", async (req, res) => {
      const { email } = req.query;
      const query = { email: email };
      const result = await myBillsCollection.find(query).toArray();
      res.send(result);
    });

    // update my-bills by id
    app.put("/my-bills/:id", async(req, res)=>{
      const newData = req.body
      const {id} = req.params;
      const query = {billsId : id}
      const update = {
        $set: newData
      }
      const result = await myBillsCollection.updateOne(query, update)
      res.send(result)
    })

    // delete my-bills by id
    app.delete("/my-bills/:id", async (req, res) => {
      3;
      const { id } = req.params;
      const query = { billsId: id };
      const result = await myBillsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!-------------------"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`PayConnect Server listening on prot ${port}`);
});
