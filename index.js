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
        const sellerCollection = client.db('rawBike').collection('sellers');
        const bookingsCollection = client.db('rawBike').collection('bookings');

        app.get('/bikes', async (req, res) => {
            const name = req.query.name;
            const query = { categoryName: name };
            const categoryName = await bikeCollections.find(query).toArray();
            res.send(categoryName);
        })

        app.post('/buyers', async (req, res) => {
            const buyers = req.body;
            const result = await buyerCollection.insertOne(buyers);
            res.send(result);
        });
        app.get('/buyers', async (req, res) => {
            const query = {};
            const buyers = await buyerCollection.find(query).toArray();
            res.send(buyers);
        });

        app.post('/sellers', async (req, res) => {
            const sellers = req.body;
            const result = await sellerCollection.insertOne(sellers);
            res.send(result);
        });

        app.get('/sellers', async (req, res) => {
            const query = {};
            const sellers = await sellerCollection.find(query).toArray();
            res.send(sellers);
        });

        app.get('/users', async (req, res) => {
            const usersEmail = req.query.users;
            const query = { email: usersEmail };
            const buyer = await buyerCollection.findOne(query);
            const seller = await sellerCollection.findOne(query);
            res.send({ buyer, seller })
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            // console.log(booking);
            const query = {
                productName: booking.productName,
                buyerEmail: booking.buyerEmail

            }

            const alreadyBooked = await bookingsCollection.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `You already book ${booking.productName}`
                return res.send({ acknowledged: false, message })
            }

            const result = await bookingsCollection.insertOne(booking);
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