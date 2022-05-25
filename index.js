const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectID } = require('bson');
const app = express();
const port = process.env.PORT || 5000;


//midlware
app.use(cors());
app.use(express.json());



app.listen(port , ()=>{
    console.log('listening to the port', port);
})