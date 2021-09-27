import * as mongo from "mongodb";
import { Database } from "../connection/mongo";

export class UserService {
  public container: mongo.Collection;

  constructor() {
    this.container = Database.collection("users");
  }

  async add(user: mongo.Document) {
    return await this.container.insertOne(user);
  }

  async find(filter: mongo.Document) {
    return await this.container.findOne(filter);
  }

  async remove(query: mongo.Document) {
    return await this.container.findOneAndDelete(query);
  }

  async list(query: mongo.Document) {
    return await this.container.find(query).count();
  }
}
