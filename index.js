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


// varify jwt token
const varifyJwt = (req, res, next) => {
    const header = req.headers.authorization;
    if(header){
        const token = header.split(' ')[1];
        jwt.verify(token, process.env.jwt_secret, function(err, decoded) {
            if(err){
                console.log(err);
                res.status(403).send('forbidden')
            }else{
                req.decoded = decoded;
                next()
            }
          })
    }else{
        res.status(401).send('Unauthorized')
    }

}

 //mongoDb Database connection
 const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.zzc8v.mongodb.net/?retryWrites=true&w=majority`;
 const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 const run = async () => {
     try{
         await client.connect();
         const productsDb = client.db("irwinTools").collection('productsDb')
         const usersDb = client.db("irwinTools").collection('usersDb')
         const ordersDb = client.db("irwinTools").collection('ordersDb')
         const reviewDb = client.db("irwinTools").collection('reviewDb')


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
        app.get('/product/:id',varifyJwt, async (req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await productsDb.findOne(query,)
            res.send(result)
        })
        // order bookings 
        app.post('/orders', varifyJwt, async (req, res) => {
            const order = req.body;
            const result = await ordersDb.insertOne(order);
            res.send(result)
        })
        //get orders by email
        app.get('/orders', varifyJwt, async (req, res) => {
            const email = req.decoded.email;
            const query = {clientEmail:email}
            const result = await ordersDb.find(query).toArray()
            res.send(result)
        })
        // get all orders 
        app.get('/allorders', varifyJwt, async (req, res) => {
            const email = req.decoded.email;
            const requester = await usersDb.findOne({email:email})
            if(requester.role === 'admin'){
                const result = await ordersDb.find().toArray()
                res.send(result)
            }else{
                res.status(403).send({message:'forbidden'})
            }
           
        })
        // delete order by id 
        app.delete('/order/:id', varifyJwt, async (req, res) =>{
            const id = req.params.id
            const query = {_id: ObjectId(id)};
            const result = await ordersDb.deleteOne(query);
            res.send(result);
        })
        //add a review 
        app.post('/review', varifyJwt, async (req, res)=>{
            const review = req.body;
            const result = await reviewDb.insertOne(review);
            res.send(result)
        })
        //get all review 
        app.get('/reviews',  async (req, res)=>{
            const result = await reviewDb.find().toArray();
            res.send(result);
        })
           // update profile
           app.put('/profile',varifyJwt, async (req, res)=>{
            const user = req.body;
            const email = user.email
            const filter = {email:email};
            const update = {
                $set: user
              };
              const result = await usersDb.updateOne(filter, update);
              res.send(result)
        })
        //get user profile
        app.get('/profile',varifyJwt, async (req, res)=>{
            const email = req.decoded.email;
            const filter = {email:email};
            const result = await usersDb.findOne(filter);
            res.send(result)
        })
         // get all users 
         app.get('/users', varifyJwt, async (req, res) => {
            const email = req.decoded.email;
            const requester = await usersDb.findOne({email:email})
            if(requester.role === 'admin'){
                const result = await usersDb.find().toArray()
                res.send(result)
            }else{
                res.status(403).send({message:'forbidden'})
            }
           
        })
     
     }
     finally{}
 }
run().catch(console.dir);

app.listen(port , ()=>{
    console.log('listening to the port', port);
})