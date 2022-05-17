import { Client } from "https://deno.land/x/postgres@v0.15.0/mod.ts";

import env from "./env.ts";

export interface Notification {
  pr_number: number;
  message_id: number;
  text: string;
}

export const client = new Client(env.DATABASE_URI);

export async function connectAndInitialize() {
  await client.connect();
  await client.queryArray(
    "CREATE TABLE IF NOT EXISTS notifications (pr_number INT PRIMARY KEY, message_id INT, text VARCHAR);",
  );
}

export function createNotification(
  prNumber: number,
  messageId: number,
  text: string,
) {
  return client.queryArray
    `INSERT INTO notifications VALUES (${prNumber}, ${messageId}, ${text});`;
}

export async function getNotification(prNumber: number) {
  return (
    await client.queryObject<Notification>
      `SELECT * FROM notifications WHERE pr_number=${prNumber};`
  ).rows[0];
}

export function updateNotification(messageId: number, text: string) {
  return client.queryArray
    `UPDATE notifications SET text=${text} WHERE message_id=${messageId};`;
}

export function deleteNotification(prNumber: number) {
  return client.queryArray
    `DELETE FROM notifications WHERE pr_number=${prNumber};`;
}
