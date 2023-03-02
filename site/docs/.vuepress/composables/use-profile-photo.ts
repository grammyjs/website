import { Api, GrammyError } from "grammy/web";
import { ref } from "vue";

export function useProfilePhoto(token: string) {
  const state = ref<"idle" | "loading" | "error" | "done" | "empty">("idle");
  const api = new Api(token);
  const error = ref<GrammyError>();
  const url = ref("");

  const refresh = async () => {
    state.value = "loading";

    try {
      const id = (await api.getMe()).id;
      const photos = await api.getUserProfilePhotos(id);
      if (photos.total_count === 0) {
        state.value = "empty";
        return;
      }
      const fileId = photos.photos[0][2].file_id;

      const file = await api.getFile(fileId);

      url.value = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      state.value = "done";
    } catch (err) {
      state.value = "error";
      error.value = err;
    }
  };

  return {
    state,
    error,
    url,
    refresh,
  };
}
