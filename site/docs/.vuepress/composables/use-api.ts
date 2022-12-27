import { Api } from "grammy/web";
import { ref, watch } from "vue";

export function useApi(token = ref(localStorage.getItem("token") || "")) {
  const api = ref<Api>(new Api(token.value));

  watch(token, (value) => {
    api.value = new Api(value, { canUseWebhookReply: () => false });
    localStorage.setItem("token", value);
  });

  return {
    api,
    token,
  };
}
