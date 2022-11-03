const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken')
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
    const Orders = client.db('geniousCar').collection('orders')

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


    // order api

    app.get('/orders',async (req,res)=>{

      let query = {}
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const order = Orders.find(query);
      const result = await order.toArray()
      res.send(result)  
    })


    app.delete('/orders/:id', async(req, res) => {
      const id = req.params.id
      const quary = { _id: ObjectId(id) }
      const result = await Orders.deleteOne(quary)
      res.send(result)
    })

    app.patch('/orders/:id', async (req, res) => {
      const id = req.params.id
      const status = req.body.status
      const filter = { _id: ObjectId(id) }
      const updateOrder = {
        $set:{
          status : status
        }
    }
      const result = await Orders.updateOne(filter, updateOrder)
      res.send(result)
    })



    app.post('/orders', async(req, res) => {
      const order = req.body
      const result = await Orders.insertOne(order)
      res.send(result)
    })


  } finally {
  }
}
run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`port is running ${port}`);
});
