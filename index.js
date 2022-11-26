const express = require ('express');
const cors = require ('cors');
require ('dotenv').config();
const port = process.env.PORT || 5001;
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();

//using middleware
app.use (cors ());
app.use (express.json ())


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.bmwcolr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



app.get('/', (req, res) => {
    res.send('raw bike server is running');
})

app.listen(port, () => console.log(`Raw bike running on ${port}`))