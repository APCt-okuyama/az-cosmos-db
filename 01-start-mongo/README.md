# Azure で mongo db

azure で mongo db (document db) を始める

## mongo db on docker

mongo db開始
```
docker run --rm -p 27017:27017 --name my-mongo1 -d mongo:latest
```

mongodb(test db)へ接続
```
docker run -it --rm mongo mongosh --host 172.21.102.78 test
```

db.version
```
db.version()
6.0.1
```

dbの確認
```
test> db
test
test> show dbs
admin   40.00 KiB
config  60.00 KiB
local   40.00 KiB
```

dbの作成 (animalという名前で作成)
```
test> use animal
switched to db animal
animal> db
animal
animal>
```

### bson
jsonではなく `bson` (binary JSON) を利用。
※ `bson` はバイナリとしてデータを扱う
※ `bson` にはdate型がある

## mongo db CRUD operation
(簡単に)

```
docker run -it --rm mongo mongosh --host 172.21.102.78 animalShelter
```

### [Create]
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

### [Read] db.collection.find({query}) 
```完全一致
db.dogs.find({name:'aaa'})
```
```
db.dogs.findOne({name:'bbb'})
```

### [Update] db.collection.updateOne updateMany
$set
```
db.dogs.updateOne({name:'aaa'},{$set:{ages:11}})
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

# Azure Cosmos DB (mongo api)

https://docs.microsoft.com/ja-jp/azure/cosmos-db/mongodb/connect-using-mongoose

```
az group create -n az-mongodb-example -l japaneast
#az group delete -n az-mongodb-example

# Create a Cosmos account for MongoDB API
az cosmosdb create --name example02account --resource-group az-mongodb-example --kind MongoDB --server-version 4.0
```

## azure cosmos db
```
az cosmosdb mongodb database create --account-name example02account --resource-group az-mongodb-example --name my-mongo-db1
```

## collection (option)
※アプリ側からも作成されるので作成は必須ではない
```
az cosmosdb mongodb collection create --account-name example02account --resource-group az-mongodb-example --database-name my-mongo-db1 --name my-collection1
```

## mongosh (docker cli) を使って接続
(接続文字列をそのまま利用)
```
docker run -it --rm mongo mongosh "mongodb://example02account:xxx ... "

test> db.version()
4.0.0

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


## アプリから mongoose を使って操作
mongoose とは node js の ライブラリ。
ORM と ODM(Document/Data Mapper), モデル定義, CRUD
REPLの使い方
```
```

# Azure で Mongo DB を利用する
cosmos db
```
```
