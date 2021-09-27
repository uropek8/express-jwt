import { ObjectId } from "mongodb";

export default class TokenModel {
  constructor(public token: string, public userId: string, public _id?: ObjectId) {}
}