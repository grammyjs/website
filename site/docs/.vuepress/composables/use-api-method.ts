import { Api, GrammyError } from "grammy/web";
import { computed, type Ref, ref } from "vue";

type FunctionPropertyOf<T> = {
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

export function useApiMethod<M extends FunctionPropertyOf<Api>>(
  api: Ref<Api>,
  method: M,
  clearTimeout: number,
) {
  const state = ref<"idle" | "loading" | "success" | "error">("idle");
  const data = ref<Awaited<ReturnType<Api[M]>>>();
  const error = ref<GrammyError>();

  async function refresh(...args: Parameters<Api[M]>) {
    data.value = undefined;
    error.value = undefined;

    const callable = api.value[method];

    state.value = "loading";
    await callable
      .apply(api.value, args)
      .then((result: Awaited<ReturnType<Api[M]>>) => {
        data.value = result;
        state.value = "success";
      })
      .catch((err) => {
        error.value = err;
        state.value = "error";
      })
      .finally(() => {
        if (clearTimeout) {
          setTimeout(() => {
            state.value = "idle";
          }, clearTimeout);
        }
      });
  }

  return {
    state,
    error,
    data,
    refresh,
  };
}

export function useTelegramApi(token: Ref<string>) {
  const api = computed(() => new Api(token.value));

  return {
    useApiMethod: <M extends FunctionPropertyOf<Api>>(
      method: M,
      clearTimeout = 0,
    ) => useApiMethod<M>(api, method, clearTimeout),
  };
}
