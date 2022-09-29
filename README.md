# az-cosmos-db

Cosmos DBを利用するときのトピックを纏める

●恩恵を受けるソリューション
(msのドキュメントより)
さまざまなデータについて、リアルタイムに近い応答時間とグローバルな規模で膨大な量のデータや読み書きを処理する必要のある Web、モバイル、ゲーム、IoT アプリケーションは、Cosmos DB の保証された高可用性、高スループット、低遅延、調整可能な整合性の恩恵を受けます。 IoT とテレマティック、小売りとマーケティング、ゲーム、Web アプリとモバイル アプリの作成に Azure Cosmos DB をどのように適用できるかをご確認ください。

IoTなどの厳しいトランザクション制御を必要としない処理に向いている。逆に厳しいトランザクション制御が必要な処理には向いていない。※エラー処理（補正トランザクション）の検討が必要

# いろいろな APIが用意されているが...

| API |  |
| --- | --- |
| SQL API | SQL |
| Cassandra API |  |
| Table API |  |
| MongoDB用 API | JavaScript (mongooseなどを利用できる) |

一般的な WEB アプリの開発なら SQL API かな。

