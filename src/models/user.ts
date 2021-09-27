import { ObjectId } from "mongodb";

export default class UserModel {
  constructor(public email: string, public password: string, public _id?: ObjectId) {}
}