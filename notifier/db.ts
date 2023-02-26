import { Collection, MongoClient } from "mongo/mod.ts";
import env from "./env.ts";

export interface Notification {
  prNumber: number;
  messageId: number;
  text: string;
}

export const client = new MongoClient();
let notifications: Collection<Notification>;

export async function connect() {
  const database = await client.connect(env.MONGODB_URI);
  notifications = database.collection("notifications");
}

export function createNotification(
  prNumber: number,
  messageId: number,
  text: string,
) {
  return notifications.updateOne({ prNumber, messageId }, { $set: { text } }, {
    upsert: true,
  });
}

export function getNotification(prNumber: number) {
  return notifications.findOne({ prNumber });
}

export async function updateNotification(messageId: number, text: string) {
  return (await notifications.updateOne({ messageId }, { $set: { text } }))
    .modifiedCount > 0;
}

export async function deleteNotification(prNumber: number) {
  return (await notifications.deleteOne({ prNumber })) > 0;
}
