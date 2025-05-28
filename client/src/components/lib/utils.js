import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to conditionally join multiple classnames together.
 * It supports any number of arguments, and any of the following formats:
 * - A single string
 * - An array of strings
 * - An object with { className: boolean } pairs
 * - A function that returns one of the above
 * - undefined (omitted)
 * - null (omitted)
 * - false (omitted)
 * - true (becomes an empty string)
 * @param inputs The classnames to join.
 * @returns A single string of classnames, or an empty string if none of the inputs were truthy.
 */
export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}
