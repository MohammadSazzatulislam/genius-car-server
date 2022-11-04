const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorize access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const Servicess = client.db("geniousCar").collection("servicess");
    const Orders = client.db("geniousCar").collection("orders");

    app.get('/', (req, res) => {
      res.send('genius car server is running')
    })

    app.get("/servicess", async (req, res) => {
      const quary = {};
      const cursor = Servicess.find(quary);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "6h",
      });
      res.send({ token });
    });

    app.get("/servicess/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: ObjectId(id) };
      const singleServices = await Servicess.findOne(quary);
      res.send(singleServices);
    });

    // order api

    app.get("/orders", verifyJWT, async (req, res) => {
      
      const decoded = req.decoded
      if (decoded.email !== req.query.email) {
        res.status(403).send({message:'unauthorize access'})
      }

      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const order = Orders.find(query);
      const result = await order.toArray();
      res.send(result);
    });

    app.delete("/orders/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const quary = { _id: ObjectId(id) };
      const result = await Orders.deleteOne(quary);
      res.send(result);
    });

    app.patch("/orders/:id",verifyJWT, async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const filter = { _id: ObjectId(id) };
      const updateOrder = {
        $set: {
          status: status,
        },
      };
      const result = await Orders.updateOne(filter, updateOrder);
      res.send(result);
    });

    app.post("/orders", verifyJWT, async (req, res) => {
      const order = req.body;
      const result = await Orders.insertOne(order);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`port is running ${port}`);
});
