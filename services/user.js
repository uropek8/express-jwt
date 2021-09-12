const db = require('../connection/mongo');

class UserServise {
  constructor() {
    this._container = db.collection('users');
  }

  async add(user) {
    return await this._container.insertOne(user);
  }

  async find(filter) {
    return await this._container.findOne(filter);
  }

  async remove(query) {
    return await this._container.findOneAndDelete(query);
  }

  async list(query) {
    return await this._container.find(query).count();
  }
}

module.exports = UserServise;