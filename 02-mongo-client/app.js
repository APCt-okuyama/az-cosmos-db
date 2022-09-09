require('dotenv').config()
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = new Schema({
    name: { type: String, default: 'hahaha' },
    age: { type: Number, min: 18, index: true },
    bio: { type: String, match: /[a-z]/ },
    date: { type: Date, default: Date.now },
    buff: Buffer
  });

const MyCommentModel = mongoose.model('Comment', Comment);

async function start(){

    //const conn = await mongoose.connect(process.env.COSMOSDB_CONNECT);
    const conn = await mongoose.connect("mongodb://"+process.env.COSMOSDB_HOST+":"+process.env.COSMOSDB_PORT+"/"+process.env.COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb", {
        auth: {
          username: process.env.COSMOSDB_USER,
          password: process.env.COSMOSDB_PASSWORD
        },
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: false
      });

    console.log('start:');

    const instance = new MyCommentModel();
    instance.name = "test";
    
    console.log('save:start');    
    await instance.save();
    console.log('save:end');

    await MyCommentModel.find({}, function (err, docs) {
        console.log('find. docs.length:', docs.length);
    });


    await conn.disconnect();
    console.log('end.');
    return;
}

start();