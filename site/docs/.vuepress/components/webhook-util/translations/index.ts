import { lang as en } from "./en_US";
import { lang as es } from "./es_ES";
import { lang as id } from "./id";
import { Translation } from "./types";
import { lang as zh } from "./zh_CN";

const translations = {
  "en-US": en,
  "es-ES": es,
  id,
  "zh-CN": zh,
} as Record<string, Translation>;

export function getTranslation(lang: string) {
  const translation = translations[lang];

  return translation || en;
}
