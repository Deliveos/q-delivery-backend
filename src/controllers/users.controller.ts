import { Context } from "koa";
import { ObjectId, Timestamp } from "mongodb";
import {client} from "../config/db.config";
import { User } from "../models/user.model";

const database = client.db("Q-Delivery")
const collection = database.collection<User>("users");

export class UserController {

  static async getAll(ctx: Context) {
    ctx.body = await collection.find().toArray();
    ctx.status = 200;
  }

  static async getOne(ctx: Context) {
    const user = await collection.findOne({ "_id": new ObjectId(ctx.params.id) });
    ctx.body = user;
  }

  // Write
  static async insertOne(ctx: Context) {
    const { Name, Role, Password } = ctx.request.body;
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0,0,0);

    const result = await collection.insertOne({
      "_id": null,
      "Name": Name as string,
      "Role": Role as string,
      "Password": Password as string,
      "Date": date.toISOString()
    });
    if (result.insertedId !== undefined && result !== null) { 
      ctx.status = 201;
    }
  }

  static async updateOne(ctx: Context) {
    const { Name, Role, Password } = ctx.request.body;
    const result = await collection.updateOne(
      {
        '_id': new ObjectId(ctx.params.id)
      },
      { 
        $set: {
          "Name": Name as string,
          "Role": Role as string,
          "Password": Password as string
        }
      }
    );
    if (result.acknowledged) {
      ctx.status = 200;
    }
  }

  static async deleteOne(ctx: Context) {
    const result = await collection.deleteOne({'_id': new ObjectId(ctx.params.id)});
    if (result.acknowledged) {
      ctx.status = 200;
    }
  }
}