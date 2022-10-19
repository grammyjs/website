export type Translation = {
  tokenCard: {
    disclaimer: {
      title: string;
      content: string;
    };
    fields: {
      token: {
        label: string;
        placeholder: string;
      };
    };
    buttons: {
      loadBotInfo: string;
    };
  };
  botCard: {
    canJoinGroups: string;
    canReadGroupMessages: string;
    inlineQueries: string;
    tabs: {
      webhookInfo: string;
      manageWebhook: string;
    };
    buttons: {
      changeToken: string;
    };
  };
  manageWebhook: {
    fields: {
      secret: {
        label: string;
        placeholder: string;
      };
      url: {
        label: string;
        placeholder: string;
        errorMessages: {
          required: string;
          invalid: string;
          protocol: string;
        }
      };
      dropPending: {
        label: string;
      };
    };
    buttons: {
      setWebhook: string;
      deleteWebhook: string;
    };
  };
  webhookInfo: {
    empty: string;
    pendingUpdates: (count: number) => string;
    lastErrorDate: (formattedDate: string) => string;
    lastSyncErrorDate: (formattedDate: string) => string;
    buttons: {
      refresh: string;
    };
  };
  error: {
    buttons: {
      retry: string;
    };
  };
};
