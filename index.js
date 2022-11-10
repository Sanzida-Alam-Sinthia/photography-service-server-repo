const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hhcmclk.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('photographyService').collection('serviceCollection');
        const reviews = client.db('photographyService').collection('reviews');
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.get('/allservices', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });
        //reviews
        app.get('/reviews', async (req, res) => {
            // const decoded = req.decoded;

            // if (decoded.email !== req.query.email) {
            //     res.status(403).send({ message: 'unauthorized access' })
            // }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviews.find(query);
            const review = await cursor.toArray();
            res.send(review);
        });
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviews.insertOne(review);
            res.send(result);
        });


    }
    finally {

    }
}
run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('Photography service server is running')
})

app.listen(port, () => {
    console.log(`Photography service server running on ${port}`);
})