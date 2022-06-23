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
      


        app.get('/orders', async(req,res)=>{
          const orderEmail =req?.query?.orderEmail;
          const query = {orderEmail:orderEmail};
          const order =await orderCollection.find(query).toArray();
          res.send(order)
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

            // user review
      app.get('/reviews', async (req,res)=>{
        const filter = req.body
        const reviews = await reviewCollection.insertOne(filter)
        res.send({success: "review uploaded ", reviews})
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