import * as mongo from "mongodb";
import { Database } from "../connection/mongo";

export class TokenService {
  public container: mongo.Collection;

  constructor() {
    this.container = Database.collection("tokens");
  }

  async add(entry: mongo.Document) {
    return await this.container.insertOne(entry);
  }

  async find(query: mongo.Document) {
    return await this.container.findOne(query);
  }

  async remove(query: mongo.Document) {
    return await this.container.findOneAndDelete(query);
  }
}
