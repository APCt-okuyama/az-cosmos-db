# Azure で MongoDB を利用する

![image](./CosmosDBMongoDB.png)
Azure での MongoDB の利用についての検証ブログになります。
MongoDBをインストールして利用するのではなく Cosmos DB の Mongo API を利用します。簡単に利用でき マネージドサービス(Cosmos DB) の恩恵も受けられるのでAzureで Mongo DB を利用したい場合の選択肢として魅力的です。

# (簡単に)Cosmos DBとは
Azure の NoSQLデータベース、ドキュメント指向データベース

※テーブル(スキーマ)設計については、RDBの正規化をベースとした設計ではなくドキュメント指向データベースの特性にあった設計を行う必要があります。
※RDBのようなトランザクション制御(同一セッション内でのロールバック)が利用できないことを前提に利用する。

# Azure Cosmos DB (mongo api)

https://docs.microsoft.com/ja-jp/azure/cosmos-db/mongodb/connect-using-mongoose

Azure Cosmos DB を作成
```
az group create -n az-mongodb-example -l japaneast
#az group delete -n az-mongodb-example

# Create a Cosmos account for MongoDB API
az cosmosdb create --name my-example01account --resource-group az-mongodb-example --kind MongoDB --server-version 4.0

# Create a DB
az cosmosdb mongodb database create --account-name my-example01account --resource-group az-mongodb-example --name my-mongo-db1
```

## collection (option)
※アプリ側からも作成されるので作成は必須ではない
```
az cosmosdb mongodb collection create --account-name my-example01account --resource-group az-mongodb-example --database-name my-mongo-db1 --name my-collection1
```

## mongosh (docker cli) の利用 ( CLI での CRUD 操作 )

## [Connect]
(接続文字列をそのまま利用)
```
docker run -it --rm mongo mongosh "mongodb://example02account:xxx ... "

test> db.version()
4.0.0

test> show dbs
my-mongo-db1  1.00 KiB

test> use my-mongo-01

my-mongo-01> db.movies.find()
[
  {
    _id: ObjectId("630d6fa6103545329cd4ae3d"),
    title: 'Amadeus',
    year: 1986,
    score: 9.2,
    rating: 'R',
    __v: 0
  }
]
```

## [Create]
コレクションへデータを投入して取得
```
db.dogs.insertOne({name:'test', age:3, breed:'corgi', catFriendly: true})

db.dogs.find()
[
  {
    _id: ObjectId("630c5b28b7929517a66e4e49"),
    name: 'test',
    age: 3,
    breed: 'corgi',
    catFriendly: true
  }
]
```

3件投入
```
db.cats.insert([{name:'aaa', age:10},{name:'bbb'},{name:'ccc'}])
DeprecationWarning: Collection.insert() is deprecated. Use insertOne, insertMany, or bulkWrite.
```
※ insert() is deprecated

## [Read] db.collection.find({query}) 
```完全一致
db.dogs.find({name:'test'})
```

```
db.dogs.findOne({name:'bbb'})
```

## [Update] db.collection.updateOne updateMany
$set
```
db.dogs.updateOne({name:'test'},{$set:{ages:11}})
```

$currentDate
```
db.cats.updateOne({name:'aaa'},{$currentDate:{lastModified:true}})

db.cats.find()
[
  {
    _id: ObjectId("630c5c97b7929517a66e4e4e"),
    name: 'aaa',
    age: 10,
    lastModified: ISODate("2022-08-29T06:45:10.428Z")
  },
```

replaceOne ドキュメントの置き換え
```
db.cats.replaceOne
```

### [Delete]
```
# {name:'ccc'}を1件削除
db.cats.deleteOne({name:'ccc'})

# 条件なしはすべて削除
db.dogs.deleteMany({})
```

### 演算子いろいろ
```
db.dogs.find({age:{ $gt: 20 }})
db.dogs.find({age:{ $lt: 20 }})
db.dogs.find({age:{ $ne: 20 }})
db.dogs.find({age:{ $in: [1,2,3] }})
db.dogs.find({age:{ $nin: [1,2,3] }})
```


# アプリ(nodejs)から mongoose を使って操作
mongoose とは node js の ライブラリ。


```
```

