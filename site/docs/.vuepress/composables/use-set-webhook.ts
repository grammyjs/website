import type { Api } from "grammy";
import { type Ref, ref, watch } from "vue";
import { useApiMethod } from "../composables/use-api-method";

type UseSetWebhookParams = {
  url?: Ref<string>;
  dropPendingUpdates?: Ref<boolean>;
  secretToken?: Ref<string>;
};

export function useSetWebhook(
  api: Ref<Api | undefined>,
  params?: UseSetWebhookParams,
) {
  const {
    url = ref(""),
    dropPendingUpdates = ref(false),
    secretToken = ref(localStorage.getItem("secret") || ""),
  } = params || {};

  const { loading, error, data, refresh } = useApiMethod(api, "setWebhook");

  watch(secretToken, (value) => localStorage.setItem("secret", value));

  return {
    loading,
    error,
    data,
    url,
    dropPendingUpdates,
    secretToken,
    setWebhook: () =>
      refresh(url.value, {
        drop_pending_updates: dropPendingUpdates.value,
        secret_token: secretToken.value || undefined,
      }),
  };
}
