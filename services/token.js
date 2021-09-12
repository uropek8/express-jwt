const db = require("../connection/mongo");

class TokenService {
  constructor() {
    this._container = db.collection("tokens");
  }

  async add(entry) {
    return await this._container.insertOne(entry);
  }

  async find(query) {
    return await this._container.findOne(query);
  }

  async remove(query) {
    return await this._container.findOneAndDelete(query);
  }
}

module.exports = TokenService;
