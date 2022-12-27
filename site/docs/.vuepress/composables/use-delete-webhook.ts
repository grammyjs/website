import type { Api } from "grammy/web";
import { type Ref, ref } from "vue";
import { useApiMethod } from "./use-api-method";

export function useDeleteWebhook(
  api: Ref<Api | undefined>,
  dropPendingUpdates: Ref<boolean> = ref(false),
) {
  const { loading, error, data, refresh } = useApiMethod(api, "deleteWebhook");

  return {
    loading,
    error,
    data,
    dropPendingUpdates,
    deleteWebhook: () =>
      refresh({ drop_pending_updates: dropPendingUpdates.value }),
  };
}
