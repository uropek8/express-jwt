import { MongoClient, Db } from 'mongodb';

export class Database {
  private static client: MongoClient;
  private static db: Db;

  private constructor(){}

  static connect(uri: string, options: object) {
    this.client = new MongoClient(uri, options);
    
    return this.client.connect();
  }

  static switchDatabase(name: string) {
    this.db = this.client.db(name);

    console.log(`Switched to database [${name}]`);
  }

  static collection(name: string) {
    return this.db.collection(name);
  }

  static dropDatabase() {
    return this.db.dropDatabase();
  }

  static close(bool: boolean) {
    return this.client.close(bool);
  }

  static async initialize(uri: string, dbName: string, options: object) {
    try {
      await this.connect(uri, options);
      
      console.log('Connected successfully to MongoDB');
      
      this.switchDatabase(dbName);
      
      return true;
    } catch (err) {
      console.error(err);
      
      return false;
    }
  }
}
