import { Api, GrammyError } from "grammy";
import { type Ref, ref } from "vue";

export function useProfilePhoto(api: Ref<Api | undefined>) {
  const loading = ref(false);
  const error = ref<GrammyError>();
  const url = ref("");

  const refresh = async (id: number, token: string) => {
    if (!api.value) return;
    loading.value = true;

    try {
      const photos = await api.value.getUserProfilePhotos(id);
      if (photos.total_count === 0) return;
      const fileId = photos.photos[0][2].file_id;

      const file = await api.value.getFile(fileId);

      url.value = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    url,
    refresh,
  };
}
