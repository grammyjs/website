import { Api, GrammyError } from "grammy/web";
import { type Ref, ref } from "vue";

type FunctionPropertyOf<T> = {
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

export function useApiMethod<M extends FunctionPropertyOf<Api>>(
  api: Ref<Api | undefined>,
  method: M,
) {
  const loading = ref(false);
  const data = ref<Awaited<ReturnType<Api[M]>>>();
  const error = ref<GrammyError>();

  async function refresh(...args: Parameters<Api[M]>) {
    if (!api.value) return;

    data.value = undefined;
    error.value = undefined;
    loading.value = true;

    const callable = api.value[method];

    await callable
      .apply(api.value, args)
      .then((result) => {
        data.value = result;
      })
      .catch((err) => {
        error.value = err;
      });

    loading.value = false;
  }

  return {
    loading,
    error,
    data,
    refresh,
  };
}
