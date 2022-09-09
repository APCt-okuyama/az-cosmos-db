require('dotenv').config()
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = new Schema({
    name: { type: String, default: 'hahaha' },
    age: { type: Number, min: 0, index: true },
    bio: { type: String, match: /[a-z]/ },
    date: { type: Date, default: Date.now },
    buff: Buffer
  });

const MyCommentModel = mongoose.model('Comment', Comment);

async function start(){

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

    const builk_data = [];
    for (let i = 0; i < 70; i++) {
      const data = {
        name: Math.floor(Math.random() * 10000),
        age: Math.floor(Math.random() * 10000)
      };
      builk_data.push(data);
    }

    try{
      console.log('insertMany:start');
      await MyCommentModel.insertMany(builk_data);
      console.log('insertMany:end');
    }catch(e){
      console.log("insertMany:error");
    }

    try{
      await MyCommentModel.find( {}, function (err, docs) {
        if (err) {
          console.log('err:', err);
        }else{
          console.log('find. docs.length:', docs.length);
        }
      });
    }catch(e){
      console.log("MyCommentModel.find:error");
    }

    //await conn.disconnect();
    console.log('end.');
    return;
}

start();