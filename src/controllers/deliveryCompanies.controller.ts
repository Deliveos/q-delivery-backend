import { Context } from "koa";
import { Int32, ObjectId } from "mongodb";
import { client } from "../config/db.config";
import { Company } from "../models/deliveryCompany.model";

const database = client.db("Q-Delivery");
const collection = database.collection<Company>("deliveryCompanies");

export class CompaniesController {

  /**
  * Get all companies from database
  */
  static async getAll(ctx: Context) {
    const companies = await collection.find().sort({ Name: 1 }).toArray();
    ctx.body = companies;
  }

  static async getOne(ctx: Context) {
    const user = await collection.findOne({ "_id": new ObjectId(ctx.params.id) });
    ctx.body = user;
  }

  // Write
  static async insertOne(ctx: Context) {
    const {Name, Date} = ctx.request.body;
    const Id = ctx.request.body.DeliveryCompanyId.Id as Int32;
    const result = await collection.insertOne(
      {
        _id: null,
        DeliveryCompanyId: {
          Id: Id
        },
        "Name": Name as string,
        "Date": Date as string
      }
    );
    if (result.insertedId !== undefined && result !== null) {
      ctx.status = 201;
    }
  }

  static async updateOne(ctx: Context) {
    const {Name, Date} = ctx.request.body;
    const result = await collection.updateOne(
      {
        '_id': new ObjectId(ctx.params.id)
      },
      { 
        $set: {
          "Name": Name as string,
          "Date": Date as string
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
