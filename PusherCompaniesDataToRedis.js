import { MongoClient } from 'mongodb';
import Redis from 'ioredis';

const BATCH_SIZE = 500; // 一度に処理するデータ数を500社に増やす
const CACHE_EXPIRY = 60 * 60 * 24; // キャッシュの有効期限を24時間に設定

async function syncCompaniesData() {
  const mongoClient = await MongoClient.connect(process.env.MONGODB_URI);
  const redisClient = new Redis(process.env.REDIS_URL);

  try {
    console.log('データ同期を開始します...');
    
    // MongoDBからデータを取得
    const db = mongoClient.db('syukatu');
    const companies = await db.collection('companies').find().toArray();
    
    // バッチ処理でRedisに保存
    for (let i = 0; i < companies.length; i += BATCH_SIZE) {
      const batch = companies.slice(i, i + BATCH_SIZE);
      const pipeline = redisClient.pipeline();
      
      // バッチごとにキャッシュキーを生成
      const batchKey = `companies:batch:${Math.floor(i / BATCH_SIZE)}`;
      pipeline.del(batchKey); // 既存のキャッシュを削除
      
      // バッチ内の全企業データを1つのJSONとして保存
      pipeline.setex(
        batchKey,
        CACHE_EXPIRY,
        JSON.stringify(batch)
      );
      
      // インデックス情報の更新
      for (const company of batch) {
        pipeline.sadd('companies:all', company._id.toString());
        pipeline.sadd(`companies:batch:${Math.floor(i / BATCH_SIZE)}:ids`, company._id.toString());
      }
      
      await pipeline.exec();
      console.log(`バッチ ${Math.floor(i / BATCH_SIZE)}: ${batch.length}社のデータを処理しました`);
    }

    // バッチの総数を保存
    await redisClient.set('companies:batch:count', Math.ceil(companies.length / BATCH_SIZE));
    
    console.log('データ同期が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await mongoClient.close();
    await redisClient.quit();
  }
}

syncCompaniesData();