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

          // order api
      
          app.post('/orders', async (req,res)=>{
            const orders =req.body;
            const result = await orderCollection.insertOne(orders)
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