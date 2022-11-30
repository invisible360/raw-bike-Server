const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5001;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


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
        const paymentsCollection = client.db('rawBike').collection('payments');
        const productCollection = client.db('rawBike').collection('products');
        const advertiseCollection = client.db('rawBike').collection('advertise');

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

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { buyerEmail: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const filter = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(filter);
            res.send(result)
        })

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })

        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })

        app.post('/products', async (req, res) => {
            const doctor = req.body;
            const result = await productCollection.insertOne(doctor);
            res.send(result);
        });

        app.get('/products', async (req, res) => {
            const email = req.query.email;
            const query = { sellerEmail: email }
            const sellerProducts = await productCollection.find(query).toArray();
            res.send(sellerProducts)
        })

        app.post('/advertiseProducts', async (req, res) => {
            const advertiseProducts = req.body;
            const result = await advertiseCollection.insertOne(advertiseProducts);
            res.send(result);
        })

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: 'advertised'
                }
            }
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        app.delete('/productsAndadvertise/:id', async (req, res) => {
            const id = req.params.id;
            const filterProduct = {
                _id: ObjectId(id)

            };
            const filterAdvertise = {
                id: id
            }
            const resultProduct = await productCollection.deleteOne(filterProduct);
            const resultAdvertise = await advertiseCollection.deleteOne(filterAdvertise);
            res.send({ resultProduct, resultAdvertise })
        })

        app.get('/advertisements/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { sellerEmail: email }
            const advertisedProducts = await advertiseCollection.find(query).toArray();
            res.send(advertisedProducts)
        })


    }
    finally {

    }

}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Raw bike server is running');
})

app.listen(port, () => console.log(`Raw bike running on ${port}`))