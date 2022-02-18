import { Context } from "koa";
import { Db, ObjectId } from "mongodb";
import { client } from "../config/db.config";
import { EventType } from "../models/event_types.model";
import { User } from "../models/user.model";

const database = client.db("Q-Delivery")
const collection = database.collection("events");

export class HomeController {

  // Read
  static async getAll(ctx: Context) {
    var event_typeSuccess = await database.collection<EventType>('event_types').findOne({ "index": 6 });
    var event_typeFail = await database.collection<EventType>('event_types').findOne({ "index": 7 });
    
    const ordersByCompanySuccess = collection.aggregate([
      { 
        $group: {
          "_id": { "id": "$OrderId" },
          "Company": {"$max": "$DeliveryCompanyId.Id"},
          "type": {"$max": "$type"},
        } 
      },
      {
        $match: {
          "type": event_typeSuccess?.name,
        }
      },
      { 
        $group: {
          "_id": { "id": "$Company" },
          "countSuccess": { "$sum": 1 },
          // "countFailed": { "$sum": "$countFailed" },
        } 
      },
    ]);

    const ordersByCompanyFails = collection.aggregate([
      { 
        $group: {
          "_id": { "id": "$OrderId" },
          "Company": {"$max": "$DeliveryCompanyId.Id"},
          "type": {"$max": "$type"},
        } 
      },
      {
        $match: {
          "type": event_typeFail?.name,
        }
      },
      { 
        $group: {
          "_id": { "id": "$Company" },
          "countFails": { "$sum": 1 },
          // "countFailed": { "$sum": "$countFailed" },
        } 
      },
    ]);

    var Success = await ordersByCompanySuccess.toArray();
    var Fails = await ordersByCompanyFails.toArray();


    Success.map((doc) => {
      for (let i = 0; i < Fails.length; i++) {
        if(Fails[i]._id.id === doc._id.id) {
          doc['countFails'] = Fails[i].countFails
        }
        doc['ids'] = {FailId: Fails[i]._id.id, SuccessId: doc._id.id} ;
      }
      
    });

    for (let i = 0; i < Success.length; i++) {
      const CompanyName = await database.collection('deliveryCompanies').findOne({ "DeliveryCompanyId": { "Id": Success[i].Company },});
      
      Success[i]['CompanyName'] = CompanyName?.Name;
    }
        
    ctx.body = Success;
  }

  static async getOne(ctx: Context) {
    const user = await collection.findOne({ "_id": new ObjectId(ctx.params.id) });
    ctx.body = user;
  }
}