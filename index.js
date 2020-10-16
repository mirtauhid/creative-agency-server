const express = require('express');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ey4wq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

app.get("/", (req, res) => {
    res.send("Welcome to Creative Agency Server")
})




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log(err);
    const adminCollection = client.db(process.env.DB_NAME).collection(process.env.DB_COL_ONE);
    const usersCollection = client.db(process.env.DB_DB_NAME).collection(process.env.DB_COL_TWO);
    const servicesCollection = client.db(process.env.DB_DB_NAME).collection(process.env.DB_COL_THREE);
    const reviewsCollection = client.db(process.env.DB_DB_NAME).collection(process.env.DB_COL_FOUR);
    console.log("db connected successfully");
    

    app.post('/admin', (req, res) => {
        const newEmail = req.body;
        adminCollection.insertOne(newEmail)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result)
            })
    })

    app.get('/admin', (req, res) => {
        const search = req.query.email;
        adminCollection.find({ email: { $regex: search } })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addAService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        servicesCollection.insertOne({ title, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addAReview', (req, res) => {
        const newReview = req.body;
        reviewsCollection.insertOne(newReview)
            .then(result => {
                console.log(result.insertedCount)
                res.send(result);
            })
    })

    app.get('/reviews', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/services/:id', (req, res) => {
        servicesCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/users', (req, res) => {
        const newOrder = req.body;
        usersCollection.insertOne(newOrder)
            .then(result => {
                console.log(result.insertedCount)
                res.send(result);
            })
    })

    app.get('/users', (req, res) => {
        if (req.query.email) {
            usersCollection.find({ email: req.query.email })
                .toArray((err, documents) => {
                    res.send(documents);
                })
        }
        else {
            usersCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
        }
    })

    app.get('/users', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

});


app.listen(process.env.PORT || 8000)