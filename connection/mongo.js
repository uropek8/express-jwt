const { MongoClient } = require("mongodb");

class Database {
  connect(uri, options) {
    this._client = new MongoClient(uri, options);
    
    return this._client.connect();
  }

  switchDatabase(dbName) {
    this._db = this._client.db(dbName);

    console.log(`Switched to database [${dbName}]`);
  }

  collection(name) {
    return this._db.collection(name);
  }

  dropDatabase() {
    return this._db.dropDatabase();
  }

  close(force) {
    return this._client.close(force);
  }

  async initialize(uri, dbName, options, reconnectDelay) {
    try {
      await this.connect(uri, options);
      console.log('Connected successfully to MongoDB');
      this.switchDatabase(dbName);
      
      return true;
    } catch (err) {
      console.error(err);

      // if (reconnectDelay) {
      //   console.log(`Unable to connect to MongoDB, retrying in ${reconnectDelay / 1000} seconds...`);
        
      //   this.close(true);
        
      //   return this.initialize(uri, dbName, options, reconnectDelay);
      // }
      
      return false;
    }
  }
}

module.exports = new Database();