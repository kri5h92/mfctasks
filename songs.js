const express = require("express");
const mongodb = require("mongodb");

const app = express();

const client = new mongodb.MongoClient(process.env.MONGO, {
    useUnifiedTopology: true
})

let collection;

const testFunction = async() => {
    try
    {
        await client.connect();
        console.log("Mongo DB Connected");
        collection = client.db().collection("learn");
    }
    catch(error) {
        console.error(error);
        process.exit(-1);
    }
}

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get('/',async(req,res) => {
    let data = await collection.find({}).toArray();
    res.json(data);
})


/*post format 
{
    "songname" : "abcd",
    "artist" : "sdhi",
    "genre" : "sfdh"
}
*/
app.post('/',async(req,res) => {

    let incomingData = req.body;
    await collection.insertOne(incomingData);
    res.send("DATA SENT");
})

//to get a particular song (query parameter is songname and artist)
app.get('/song', async(req,res) => {
    const { songname, artist } = req.query
    let data = await collection.find({songname: songname, artist: artist}).toArray();
    res.json(data);
})

//to get all songs with that name
app.get('/songs',async(req,res) => {
    const { songname } = req.query
    let data = await collection.find({songname: songname}).toArray();
    res.json(data);
})

//to get all songs of that artist
app.get('/artist',async(req,res) => {
    const { artist } = req.query
    let data = await collection.find({artist: artist}).toArray();
    res.json(data);
})

//to get all songs of that genre
app.get('/genre',async(req,res) => {
    const { genre } = req.query
    let data = await collection.find({genre: genre}).toArray();
    res.json(data);
})

testFunction().then(() => {
    app.listen(3030, () => {
        console.log("Server Running");
    })
})
