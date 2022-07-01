const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors=require('cors');
const ObjectId=require('mongodb').ObjectId;
const app=express();
const port=process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://testing:wnuj1RBkBsOSEsgG@cluster0.m0n59.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
      const database = client.db("billing-list");
      const billingCollection = database.collection("add-billing");

      //get full database
      app.get('/list', async (req,res)=>{
        const cursor=billingCollection.find({});
        const billings = await cursor.toArray();
        res.send(billings);
      });

      //update api
      app.put('/update-billing/:id', async (req,res)=>{
        const id= req.params.id;
        const updatedBilling=req.body;
        const query= {_id:ObjectId(id)};
        const options= {upsert:true}
        const updateDoc={
            $set:{
                name:updatedBilling.name,
                email:updatedBilling.email,
                phone:updatedBilling.phone,
                ammount:updatedBilling.ammount,
            }
        }
        const result= await billingCollection.updateOne(query,updateDoc,options);
        res.json(result)
      })

      //delete api
      app.delete('/delete-billing/:id', async(req,res)=>{
        const id=req.params.id;
        const query= {_id:ObjectId(id)};
        const result= await billingCollection.deleteOne(query);
        res.json(result)
      })

      //get api
      app.get('/billing-list', async (req,res)=>{
        const cursor=billingCollection.find({});
        const page = req.query.page;
        const size = parseInt(req.query.size);
        let result;
        if (page) {
            result= await cursor.skip(page*size).limit(size).toArray();
        }
        else{
            await cursor.toArray();
        }
        const count = await billingCollection.countDocuments();
        res.send({
            count,
            result
        });
      })

      //post api
      app.post('/add-billing',async (req,res)=>{
        const newBilling= req.body;
        const result= await billingCollection.insertOne(newBilling);
        res.json(result);
      })
    }
    finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('Running my crud server')
});

app.listen(port,()=>{
    console.log('running server on port',port)
})