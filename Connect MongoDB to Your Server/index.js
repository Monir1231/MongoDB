const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT ||3000
// require('dotenv').config();

// middleware 
app.use(express.json())
app.use(cors())

// mongodb conncet 
const uri = "mongodb+srv://monirmolla324_db_user:stO9TxzFUM2DOBD6@mongobdstart.vlak47q.mongodb.net/?retryWrites=true&w=majority&appName=mongobdStart";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // create db and collection 

    const db = client.db("mydatabase")
    const userCollection  = db.collection("users")
  
    // const user = {name:"monir",age:23,email:"mollamonir455@gamil.com"}
    // userCollection.insertOne(user)

    // new post 
    app.post("/new-post", async(req,res)=>{
       try {
         const newuser = (req.body)
       const result = await userCollection.insertOne(newuser)
       res.status(200).json({message:"user add succedful",result})
       } catch (error) {
        res.status(404).json({message:"failed to create user",error})
       }
    })

    // find new user 
    app.get("/users", async(req,res)=>{
     try {
       const users = await userCollection.find().toArray()
         res.status(200).json({message:"users show succedful",users})
     } catch (error) {
      res.status(404).json({message:"failed to receved user",error})
     }
    })

    // find sigle user id 
    app.get("/users/:id", async(req,res)=>{
      try {
        const {id} = req.params
        const user = await userCollection.findOne({_id: new ObjectId(id)})
        if(!user){
          res.status(404).json({message: "user not found",user})
        }
        res.status(200).json(user)
      } catch (error) {
         res.status(404).json({message:"failed to receved user",error})
      }
    })

    // find email by user 
    app.get("/users/user/:gmail", async (req,res)=>{
      const {gmail} = req.params;
     
    try {
      const user = await userCollection.find({gmail: gmail,age:{$gt:100}},{projection:{name:1}}).toArray()
      res.json(user)
    } catch (error) {
       res.status(404).json({message:"failed to receved user",error})
    }
    })

    // update info mongo db 
    app.patch("/update-user/:id", async (req,res)=>{
      const {id} = req.params;
      const userdata = req.body
   try {
 
  const filter = {_id : new ObjectId(id)}

  const updateinfo = {
    $set:{...userdata}
  }

  const options = {upsert: true}
     const result = await userCollection.updateOne(filter,updateinfo,options)
   } catch (error) {
     res.status(404).json({message:"failed to receved user",error})
   }
    })

    app.patch("/update/increase-age", async(req,res)=>{
      try {
        const result = await userCollection.updateMany({},{$set:{status:"pending"}})
        res.json(result)
      } catch (error) {
         res.status(404).json({message:"failed to update to user",error})
      }
    })

    //  Delete Operations: deleteOne()
     app.delete("/delete/user/:id", async (req,res)=>{
      const {id} = req.params;
      const userdata = req.body

      try {
        const filter = {_id: new ObjectId (id)}
        const deleteuser = await userCollection.deleteOne(filter)
        res.status(200).json({message:"user delete succedful",deleteuser})
      } catch (error) {
        res.status(404).json({message:"failed to delete to user",error})
      }
     })


  //  Delete Operations: deleteMany()
  app.delete("/delete-users/status", async (req,res)=>{
    const {status} = req.body
    try {
      const result = await userCollection.deleteMany({status})
      res.status(200).json({message:"status delete succedfull",result})
    } catch (error) {
      res.status(404).json({message:"failed to delete to users",error}) 
    }
  })

  // find user older than 18

  app.get("/users/older-than/:age",async (req,res)=>{
    const {age} = req.params;
    try {
    const value = parseInt(age)
    const users = await userCollection.find({age: {$lte: value}}).toArray()
    res.status(200).json(users)
    } catch (error) {
       res.status(404).json({message:"failed to gt to users",error}) 
    }
  })

  // Logical Operators: $and, $or, $not, $nor

  app.get("/users/logical-operators/and", async(req,res)=>{
    const users = await userCollection.find({
      $nor:[
        {age:{$gt: 29}},
       { name:"anik"}
      ]
    })
      
      // {age:{$not:{$lt:25}}})
      .toArray()
    res.json(users)
  })


  // element Operators: $exists and $type

  app.get("/element-operators/with-status", async (req,res)=>{
    const users = await userCollection.find(
      // {status:{$exists:false}}
      {age:{$type:"string"}}
    
    ).toArray()
     res.json(users)
  })


  //  Evaluation Operators: $regex
  app.get("/evaluation-operators/name-starts-a", async (req,res)=>{
    const users = await userCollection.find({
      name:{$regex:"^k", $options: 'i'}
    }).toArray()
    res.json(users)
  })

  // Array Operators: $all, $size, $elemMatch

  app.get("/array-operators/skills", async (req,res)=>{
    const users = await userCollection.find({
    //  skills:{$all:["javascript","node.js"]}
      skills:{$size:2}
    }).toArray()
    res.json(users)
  })











    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})