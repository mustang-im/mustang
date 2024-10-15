import type { Calendar } from "../Calendar";
import { SQLStorage } from "../SQL/SQLStorage";

export function setStorage(cal: Calendar) {
  if (!cal.storage) {
    cal.storage = new SQLStorage();
  }
}