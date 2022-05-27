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

 //mongoDb Database connection
 const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.zzc8v.mongodb.net/?retryWrites=true&w=majority`;
 const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 const run = async () => {
     try{
         await client.connect();
         const productsDb = client.db("irwinTools").collection('productsDb')

        // get all the products
        app.get('/', async (req, res) => {
            const products = await productsDb.find().toArray()
            res.send(products)
        })

     }
     finally{}
 }
run().catch(console.dir);

app.listen(port , ()=>{
    console.log('listening to the port', port);
})