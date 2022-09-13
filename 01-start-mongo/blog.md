[f:id:mountain1415:20220913154230p:plain]
# はじめに
こんにちは、ACS事業部の奥山です。  
Azure での MongoDB の利用についての検証を行いましたので備忘録も兼ねてブログにしておきます。  

[f:id:mountain1415:20220913151321p:plain]

MongoDBをインストールして利用するのではなく Azure Cosmos DB のMongoDB 用API を利用します。Azure Cosmos DB のフルマネージドサービスとしての恩恵(管理、更新、およびパッチ適用が自動的に行われる)も受けられるのでAzureで Mongo DB を利用したい場合の選択肢として魅力的です。
MongoDBを利用している既存のアプリケーションをAzureへ移行させる場合も有力な候補なのではないでしょうか。

# (簡単に)Cosmos DBとは
Azure の フルマネージドのNoSQLデータベース、ドキュメント指向データベースです。数ミリ秒 (1 桁台) の応答時間と、自動および即時のスケーラビリティなどが特徴になります。

※テーブル(スキーマ)設計については、RDBの正規化をベースとした設計ではなくドキュメント指向データベースの特性にあった設計を行う必要があります。  
※RDBのようなトランザクション制御(同一セッション内でのロールバック)が利用できないことを前提に利用する。  

本ブログでは簡単に使い方を紹介したいと思います。手順としては  
1. Azure Cosmos DBの作成  
2. Mongo Shell での操作  
3. アプリケーションからの操作 (mongooseの利用)  

# Azure Cosmos DB のリソースモデルについて

Azure Cosmos DB のリソースは３つの構成要素からなり、アカウント・DB・コンテナ(コレクション)は図にすると以下のような関係になります。  
[f:id:mountain1415:20220913151835p:plain]

※コンテナの部分は Cosmos API によって呼び名が変わります。  
※データベース単位またはコンテナ単位でスループットを設定可能です。  

# Azure Cosmos DB (mongo api)の作成
Azure CLIを使ってAzure Cosmos DB アカウント・DB・コレクション を作成します。

```
az group create -n az-mongodb-example -l japaneast
#az group delete -n az-mongodb-example

# Create a Cosmos account for MongoDB API
az cosmosdb create --name my-example01account --resource-group az-mongodb-example --kind MongoDB --server-version 4.0

# Create a DB
az cosmosdb mongodb database create --account-name my-example01account --resource-group az-mongodb-example --name my-mongo-db1
```

## collection (option)
※アプリ側からも作成できるので必須ではない
```
az cosmosdb mongodb collection create --account-name my-example01account --resource-group az-mongodb-example --database-name my-mongo-db1 --name mycoll01
```

## Mongoコマンド での CRUD 操作 (mongosh の利用)
mongoコマンドでの CRUD 操作 の例を以下に示します。
※dockerイメージを利用しています。

## [Connect]

Azure Portalから取得した接続文字列をそのまま利用します。
```
docker run -it --rm mongo mongosh "mongodb://example01account: ... "

test> db.version()
4.0.0

test> show dbs
my-mongo-db1  1.00 KiB

test> use my-mongo-db1

my-mongo-db1> 
```

## [Create] db.collection.insertOne
コレクションへデータを投入します。
```
db.mycoll01.insertOne({name:'user1', age:1, tel:'09011111111', hobby: 'baseball'})
db.mycoll01.insertOne({name:'user2', age:2, tel:'09022222222', hobby: 'soccer'})
db.mycoll01.insertOne({name:'user3', age:3, tel:'09033333333', hobby: 'tennis'})
```

## [Read] db.collection.find({query}) 
全件取得
```
db.mycoll01.find()
[
  {
    _id: ObjectId("631fd1392ff9d30d2637d15a"),
    name: 'user1',
    age: 1,
    tel: '09011111111',
    hobby: 'baseball'
  },
  {
    _id: ObjectId("631fd1412ff9d30d2637d15b"),
    name: 'user2',
    age: 2,
    tel: '09022222222',
    hobby: 'soccer'
  },
  {
    _id: ObjectId("631fd1472ff9d30d2637d15c"),
    name: 'user3',
    age: 3,
    tel: '09033333333',
    hobby: 'tennis'
  }
]
```

1件取得
```
db.mycoll01.find({name:'user1'})
```

## [Update] db.collection.updateOne updateMany
$set
```
db.mycoll01.updateOne({name:'user1'},{$set:{age:5}})
```

$currentDate ※現在日時を追加
```
db.mycoll01.updateOne({name:'user1'},{$currentDate:{lastModified:true}})

db.mycoll01.find({name:'user1'});
[
  {
    _id: ObjectId("631fe0132ff9d30d2637d15d"),
    name: 'user1',
    age: 5,
    tel: '09011111111',
    hobby: 'baseball',
    lastModified: ISODate("2022-09-13T01:46:57.941Z")
  }
]
```

### [Delete]
```
# {name:'user1'}を1件削除
db.mycoll01.deleteOne({name:'user1'})

# 条件なしはすべて削除
db.mycoll01.deleteMany({})
```

### いろいろな演算子
```
db.mycoll01.find({age:{ $gt: 2 }})
db.mycoll01.find({age:{ $lt: 2 }})
db.mycoll01.find({age:{ $ne: 2 }})
db.mycoll01.find({age:{ $in: [1,2] }})
db.mycoll01.find({age:{ $nin: [1,3] }})
:
```

### indexの作成, Sort, 集計

indexを作成することでソートや集計が可能になります。

すべてのフィールドにindexを作成する。
```
db.mycoll01.createIndex( { "$**" : 1 } )
```
※開発時はすべてのフィールドに対するワイルドカード インデックスから始めることを強くお勧め。  
※多くのフィールドを持つドキュメントでは、書き込みと更新の要求ユニット (RU) 料金が高くなる場合があります。そのため多くのフィールドを持つドキュメントでは個別のインデックスを検討する。  

sort
```
db.mycoll01.aggregate( [
  { $sort: { age : 1} }
] )
```

"age"でグルーピングしてレコード数をカウント
```
db.mycoll01.aggregate( 
  { $group: { "_id": "$age", 
              "recourd_count": { $sum: 1 } } }
)
```

単純な集計であれば aggregateオペレーター を利用して実現できそうです。 複雑な集計を行いたい場合は MongoDBであれば Map/Reduce を利用して行うことができるのですが Azure Cosmos DB の場合は Map/Reduce がサポートされていないようです。このあたりは注意が必要です。[Azure Cosmos DB's API for MongoDB supported features and syntax](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb/feature-support-40)


# アプリ(nodejs)から mongoose を使って操作
次は node js アプリケーションから利用する場合の簡単な例になります。
node js の ライブラリ mongoose を利用することで簡単に組み込むことができます。

## node js
```
node -v 
v14.18.2
```

dotenv と mongoose を利用します。  
package.json
```
:
  "dependencies": {
    "dotenv": "^16.0.2",
    "mongoose": "^5.13.15"
  }
:
```

ソースコード (app.js) の内容としては以下通りです。  
1. スキーマ定義  
2. Cosmos DBへの接続処理  
3. Userモデルを作成して保存  
4. Cosmos DB からデータの取得  
```
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
```


# まとめ
今回は MongoDB 用 Azure Cosmos DB API を紹介しました。
マイクロソフトのドキュメントも十分に用意されているので導入は簡単に行えて、フルマネージドのNoSQLデータベースとしての恩恵をうけられます。
気になった点は既存のアプリケーションからの移行の場合、[サポートれていない機能](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb/feature-support-40)があるので注意が必要ということでした。

# 最後に
私達のチームでは、Azure・AKSを活用したシステムのSIや内製化のお手伝いをさせていただいております。 Azureやコンテナ技術の知見を持つエンジニアが対応いたします。ご相談等ありましたらぜひご連絡ください。
