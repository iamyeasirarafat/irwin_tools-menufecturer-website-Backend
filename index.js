const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



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
         const usersDb = client.db("irwinTools").collection('usersDb')


         //login and sign jwt token
         app.put('/login',async (req, res) => {
             const email = req.query.email;
             const filter = {email:email};
             const options = { upsert: true };
             const user = {email:email}
             const update = {
                $set: user
              };
              const result = await usersDb.updateOne(filter, update, options);
              
              if(result.acknowledged){
               const token = jwt.sign({email:email}, process.env.jwt_secret, { expiresIn: '1h' }) 
               res.send({result:result, token:token})
              }

         })
        // get all the products
        app.get('/', async (req, res) => {
            const products = await productsDb.find().toArray()
            res.send(products)
        })
        // get a single product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await productsDb.findOne(query,)
            res.send(result)
        })
        

     }
     finally{}
 }
run().catch(console.dir);

app.listen(port , ()=>{
    console.log('listening to the port', port);
})