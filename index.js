const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4lwt8qz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const Servicess = client.db("geniousCar").collection("servicess");

    app.get("/servicess", async (req, res) => {
      const quary = {};
      const cursor = Servicess.find(quary);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/servicess/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: ObjectId(id) };
      const singleServices = await Servicess.findOne(quary);
      res.send(singleServices);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`port is running ${port}`);
});
