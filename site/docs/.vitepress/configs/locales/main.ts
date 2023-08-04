import type { NotFound } from "../../shared/types";
import * as config from "./index";

export const notFound: Record<string, NotFound> = {
  ...config.notFoundEn,
  ...config.notFoundId,
  ...config.notFoundEs,
  ...config.notFoundUk,
  ...config.notFoundZh,
};
