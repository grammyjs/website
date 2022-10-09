declare type SetwebhookUtilLabels = {
  token: {
    label: string
    placeholder: string
  }
  url: {
    label: string
    placeholder: string
  }
  buttons: {
    setWebhook: string
    deleteWebhook: string
  }
}

declare const __SETWEBHOOKUTIL_STRINGS__: Record<string, SetwebhookUtilLabels>
