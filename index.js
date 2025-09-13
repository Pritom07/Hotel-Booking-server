require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.r5e76.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const roomsCollection = client.db("HotelBookingSystem").collection("rooms");
    const bookingsCollection = client
      .db("HotelBookingSystem")
      .collection("bookings");

    app.get("/rooms", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const cursor = roomsCollection.find();
      const result = await cursor
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.get("/totDocument", async (req, res) => {
      const totDocument = await roomsCollection.estimatedDocumentCount();
      res.send(totDocument);
    });

    app.delete("/room/:id", async (req, res) => {
      const roomID = req.params.id;
      const query = { _id: new ObjectId(roomID) };
      const result = await roomsCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/rooms", async (req, res) => {
      const roomData = req.body;
      const result = await roomsCollection.insertOne(roomData);
      res.send(result);
    });

    app.get("/rooms/edit_room/:id", async (req, res) => {
      const roomID = req.params.id;
      const query = { _id: new ObjectId(roomID) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });

    app.patch("/rooms/udpateRoom/:id", async (req, res) => {
      const roomID = req.params.id;
      const updatedData = req.body;
      const pricePerNight = updatedData.pricePerNight;
      const beds = updatedData.beds;
      const description = updatedData.description;
      const type = updatedData.type;
      const available = updatedData.available;
      const filter = { _id: new ObjectId(roomID) };
      const updateDoc = {
        $set: {
          pricePerNight,
          beds,
          description,
          type,
          available,
        },
      };
      const result = await roomsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Hotel Room Booking System");
});

app.listen(port);
