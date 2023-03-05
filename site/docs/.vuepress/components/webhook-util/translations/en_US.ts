import { Translation } from "./types";

export const lang: Translation = {
  tokenCard: {
    disclaimer: {
      title: "Disclaimer",
      content:
        "We don’t take your bot token to the back end. It will only be stored in your browser’s local storage. Don’t provide your bot token to places you don’t trust.",
    },
    fields: {
      token: {
        label: "Bot Token",
        placeholder: "The one which @BotFather gave you.",
      },
    },
    buttons: {
      loadBotInfo: "Load Bot Info",
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
      changeToken: "Change Token",
    },
  },
  manageWebhook: {
    fields: {
      secret: {
        label: "Webhook secret",
        placeholder: "Secret value that will be sent with every update",
      },
      url: {
        label: "Webhook URL",
        placeholder: "Full URL to your webhook",
        errorMessages: {
          invalid: "Invalid URL specified.",
          protocol: "The main Bot API server only allows HTTPS.",
          required: "Specify a URL.",
        },
      },
      dropPending: {
        label: "Drop pending updates",
      },
    },
    buttons: {
      setWebhook: "Set Webhook",
      deleteWebhook: "Delete Webhook",
    },
  },
  webhookInfo: {
    empty: "No webhook is set",
    pendingUpdates: (count: number) =>
      `${count} pending update${count !== 1 ? "s" : ""}`,
    lastErrorDate: (formattedDate: string) => `Last error: ${formattedDate}`,
    lastSyncErrorDate: (formattedDate: string) =>
      `Last synchronization error: ${formattedDate}`,
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
