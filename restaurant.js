const express = require("express");
const mongodb = require("mongodb");

const app = express();

const client = new mongodb.MongoClient(process.env.MONGO, {
    useUnifiedTopology: true
})

app.use(express.json());
app.use(express.urlencoded({extended: true}));


let collection1,collection2;

const testFunction = async() => {
    try
    {
        await client.connect();
        console.log("Mongo DB Connected");
        collection1 = client.db().collection("deliveryboys"); //db stores details of delivery boy
        collection2 = client.db().collection("orders"); //db stores details of orders
    }
    catch(error) {
        console.error(error);
        process.exit(-1);
    }
}

app.get('/deliveryboy', async(req,res) => {
    let data = await collection1.find({}).toArray();
    res.json(data);
})

/* post format for deliveryboy
{
    "name": "xxx",
    "driverid": 1,
    "mobile": "9021912023",
    "isBusy" : true/false
}
*/
app.post('/deliveryboy', async(req,res) => {
    let incomingData = req.body;
    await collection1.insertOne(incomingData);
    res.send("DATA SENT");
})
//to update status of delivery boy
app.put('/deliveryboy', async(req,res) => {
    let incomingData = req.body;
    await collection1.updateOne({"driverid":incomingData.driverid},{$set:{"isBusy":incomingData.isBusy}},{"upsert":false});
    res.send("STATUS UPDATED");
})

app.get('/order', async(req,res) => {
    let data = await collection2.find({}).toArray();
    res.json(data);
})

/* post format
{
    "id": 1,
    "driverid": 11,
    "items": {"paneer":2,"soup":1},
    "totalcost": 500,
    "isDelivered": true/false
}
*/
app.post('/order', async(req,res) => {
    let incomingData = req.body;
    let driverid = incomingData.driverid;

    let data = await collection1.find({driverid: driverid}).toArray();
    
    if(data[0].isBusy === true)
    {
        res.status(400)
        res.send("Driver Busy, Choose another driver");
        return;
    }
    else
    {
        await collection2.insertOne(incomingData);
        await collection1.updateOne({driverid: driverid},{$set:{"isBusy":true}},{"upsert":false});
    }      

    res.send("DATA SENT");
})

//to update status of the order
app.put('/order', async(req,res) => {  
    let incomingData = req.body;
    const query = {"id": incomingData.id}
    await collection2.updateOne(query,{$set:{"isDelivered" : incomingData.isDelivered}},{"upsert":false})
    res.send("STATUS UPDATED");
})

//query to get order by particular driver (driver id is the query)
app.get('/order', async(req,res) => {
    const {driverid} = req.query
    let data = await collection2.find({driverid : driverid}).toArray();
    res.json(data);
})

testFunction().then(() => {
    app.listen(3000, () => {
        console.log("Server Running");
    })
})