const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vfcr5oq.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
        try{
            await client.connect()
            console.log('database connected');
            const serviceCollection = client.db('computer_tool').collection('services');
            const orderCollection = client.db('computer_tool').collection('orders');
            const reviewCollection = client.db('computer_tool').collection('reviews');
            const usersCollection = client.db('computer_tool').collection('users');

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
      //create user
      app.put('/user/:email',async(req,res)=>{
        const email=req.params.email;
        const user = req.body;
        const filter ={email:email};
       const options = {upsert:true};
       const updateDoc={
        $set:user,
       };
       const result = await usersCollection.updateOne(filter,updateDoc,options);
       res.send(result);
      })

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

        app.get('/orders', async(req,res)=>{
          const orderEmail =req?.query?.orderEmail;
          const query = {orderEmail:orderEmail};
          const order =await orderCollection.find(query).toArray();
          res.send(order)
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