import { Translation } from "./types";

export const lang: Translation = {
  tokenCard: {
    disclaimer: {
      title: "About your token",
      content:
        "We never store your bot's token in the backend. It is stored in your browser's localStorage. Do not go around giving your token to random websites, no matter how nicely they ask!",
    },
    fields: {
      token: {
        label: "Bot Token",
        placeholder: "Obtained from talking to @botfather",
      },
    },
    buttons: {
      loadBotInfo: "Load bot info",
    },
  },
  botCard: {
    canJoinGroups: "Can join groups",
    canReadGroupMessages: "Can read all group messages",
    inlineQueries: "Supports inline queries",
    tabs: {
      webhookInfo: "Webhook Info",
      manageWebhook: "Manage Webhook",
    },
    buttons: {
      changeToken: "Change token",
    },
  },
  manageWebhook: {
    fields: {
      secret: {
        label: "Webhook Secret",
        placeholder: "Secret value telegram sends to your bot on every update",
      },
      url: {
        label: "Webhook URL",
        placeholder: "Full URL to your webhook",
      },
      dropPending: {
        label: "Drop pending updates",
      },
    },
    buttons: {
      setWebhook: "Set webhook",
      deleteWebhook: "Delete webhook",
    },
  },
  webhookInfo: {
    empty: "No webhook set",
    pendingUpdates: (count: number) =>
      `${count} pending update${count !== 1 ? "s" : ""}`,
    lastErrorDate: (formattedDate: string) => `Last error (${formattedDate})`,
    lastSyncErrorDate: (formattedDate: string) =>
      `Last ynchronization error date: ${formattedDate}`,
    buttons: {
      refresh: "Refresh",
    },
  },
  error: {
    buttons: {
      retry: "Retry",
    },
  },
};
