const express = require('express');
const jwt = require('jsonwebtoken');
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
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try {
        const serviceCollection = client.db('photographyService').collection('serviceCollection');
        const reviews = client.db('photographyService').collection('reviews');
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2d' })
            res.send({ token })
        })
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
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        });
        //reviews
        app.get('/reviews', async (req, res) => {


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
        app.get('/reviews/:service', async (req, res) => {

            const id = req.params.id;

            let query = {};
            if (req.query.service) {
                console.log(req.query.service)
                query = {
                    service: req.query.service
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

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviews.deleteOne(query);
            res.send(result);
        })
        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const reviewtext = req.body.reviewtext
            const query = { _id: ObjectId(id) }
            const updatedReview = {
                $set: {
                    reviewtext: reviewtext
                }
            }
            const result = await reviews.updateOne(query, updatedReview);
            res.send(result);
        })
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