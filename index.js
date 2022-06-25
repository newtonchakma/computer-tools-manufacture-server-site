const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vfcr5oq.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function varifyJWT(req,res,next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message:'UnAuthorized access'});
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
      return res.status(403).send({message: 'Forbidden access'})
    }
    req.decoded = decoded;
    next();
  })
}

async function run(){
        try{
            await client.connect()
            console.log('database connected');
            const serviceCollection = client.db('computer_tool').collection('services');
            const orderCollection = client.db('computer_tool').collection('orders');
            const reviewCollection = client.db('computer_tool').collection('reviews');
            const usersCollection = client.db('computer_tool').collection('users');
            const profileCollection = client.db('computer_tool').collection('profile');

            app.get('/service', async(req, res) =>{
                const query = {};
                const cursor = serviceCollection.find(query);
                const services = await cursor.toArray()
                res.send(services)
            })
            app.get('/service/:id', async(req, res) =>{
              const id = req.params.id;
              const query = {_id:ObjectId(id)}             
             const service = await serviceCollection.findOne(query)
              res.send(service)
          });
        
         app.put('service/:id', async(req,res)=>{
          const id = req.params.id;
          console.log(id);
          const data = req.body.availablequantity;
          console.log(data);
          const filter = {_id:ObjectId(id)};
          const options = {upset:true};
          const updateDoc = {
            $set:{
              quantity:data.newQuantity
            }
          };
          const result = await serviceCollection.updateOne(filter,updateDoc,options);
          res.send(result)
        })
        
       app.post('/create-payment-intent', varifyJWT, async(req,res)=>{
        const service =req.body;
        const price = service.price;
        const amount = price*100;
        const paymentIntent = await stripe.paymentIntents.create({
          amount:amount,
          currency:'usd',
          payment_method_types:['card']
        });
        res.send({clientSecret: paymentIntent.client_secret})
       });

      //create admine
      app.put('/user/admin/:email',varifyJWT, async(req,res)=>{
        const email=req.params.email;
        const requester = req.decoded.email;
        const requesterAccoount = await usersCollection.findOne({email:requester});
        if(requesterAccoount.role === 'admin'){
          const filter ={email:email};
          const updateDoc={
           $set:{role:'admin'},
          }
          const result = await usersCollection.updateOne(filter,updateDoc);
          res.send(result);
        }
        else{
          res.status(403).send({message: 'forbidden'});
        }
      })
      // grt admine api
      app.get('/admin/:email', async(req,res)=>{
        const email = req.params.email;
        const user = await usersCollection.findOne({email:email});
        const isAdmin= user.role === 'admin';
        res.send({admin: isAdmin})
      })

  
      //create user
      app.put('/user/:email',async(req,res)=>{
        const email=req.params.email;
        const user = req.body;
        const filter ={email:email};
       const options = {upsert:true};
       const updateDoc={
        $set:user,
       }
       const result = await usersCollection.updateOne(filter,updateDoc,options);
       const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1h'})
       res.send({result, token});
      })
      // get user
      app.get('/user',varifyJWT, async(req,res)=>{
        const users = await usersCollection.find().toArray()
        res.send(users)
      })
      // order api
        app.post('/orders', async(req,res)=>{
          const orderEmail =req.body;
          const query = {orderEmail:orderEmail.email};
          const exists = await orderCollection.findOne(query);
          if(exists){
            return res.send({success:false, orderEmail:exists});
            
          }
          const results = await orderCollection.insertOne(orderEmail);
          res.send({success:true,results})
        })
        //get order
        app.get('/orders',varifyJWT, async(req,res)=>{
          const orderEmail =req?.query?.orderEmail;
          const decodedEmail = req.decoded.email;
          if(orderEmail === decodedEmail){
            const query = {orderEmail:orderEmail};
            const order =await orderCollection.find(query).toArray();
           return res.send(order)
          }
          else{
            return res.status(403).send({message: 'forbidden access'})
          }
         
        })

         
        // delete order
         app.delete("/orders/:id", async(req,res)=>{
            const id = req.params.id;
            const filter = {_id:ObjectId(id)};
            const result = await orderCollection.deleteOne(filter);
            res.send(result)
         })


      // user reviews added
        app.post('/reviews', async(req,res)=>{
          const reviews =req.body;
          const result = await reviewCollection.insertOne(reviews)
          res.send(result)
        })
        // user review get
      app.get("/reviews", async (req, res) => {
        const reviews = await reviewCollection.find({}).toArray()
        res.send(reviews)
    })

    app.post('/profile', async (req, res) => {
      const profile = req.body;
      const result = await profileCollection.insertOne(profile);
      res.send(result);
    })
    app.get('/profile', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = profileCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await orderCollection.findOne(query)
      res.send({ success: "get successfully", result })
  })
       app.delete('/allproducts/:id', VerifyJwt, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await TotalServiceCollections.deleteOne(query)
            res.send(result)
        }) 

        }
        finally{

        }
}
run().catch(console.dir)



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Computer tools app listening on port ${port}`)
})