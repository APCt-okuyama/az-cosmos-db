require('dotenv').config()
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 1. スキーマの定義
const MyUser = new Schema({
  name: { type: String, default: 'user_x' },
    age: { type: Number, default: 18 },
    tel: { type: String, default: "12345" },
    hobby: { type: String, default: "hobby" }
  });

const MyUserModel = mongoose.model('mycoll01', MyUser);

async function start(){
    //2. 接続
    const conn = await mongoose.connect("mongodb://"+process.env.COSMOSDB_HOST+":"+process.env.COSMOSDB_PORT+"/"+process.env.COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb", {
        auth: {
          username: process.env.COSMOSDB_USER,
          password: process.env.COSMOSDB_PASSWORD
        },
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: false
      });

    //3. モデルを作成して保存
    const instance = new MyUserModel();
    await instance.save();

    //4. 保存されたデータを参照 ※条件指定なしなのですべて取得
    await MyUserModel.find({}, function (err, docs) {
        console.log('find. docs.length:', docs.length);
        console.log(docs);
    });

    console.log('end.');
    return;
}

start();