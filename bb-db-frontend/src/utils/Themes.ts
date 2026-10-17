import { $currentTheme } from "@/store";
import { config } from "@config";

export default function isClassic() {
  if ($currentTheme.value === "default") return false;
  if (config.theme === "classic") return true;
  return false;
}
