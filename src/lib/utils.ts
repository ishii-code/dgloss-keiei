import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** クラス結合（shadcn/ui 標準）。 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
