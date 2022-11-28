const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5001;
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();

//using middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.bmwcolr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const bikeCollections = client.db('rawBike').collection('bike');
        const buyerCollection = client.db('rawBike').collection('buyers');

        app.get('/bikes', async (req, res) => {
            const name = req.query.name;
            const query = {categoryName: name};
            const categoryName = await bikeCollections.find(query).toArray();
            res.send (categoryName);
        })

        app.post('/buyers', async (req, res) => {
            const buyers = req.body;
            const result = await buyerCollection.insertOne(buyers);
            res.send(result);
        });

    }
    finally {

    }

}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Raw bike server is running');
})

app.listen(port, () => console.log(`Raw bike running on ${port}`))