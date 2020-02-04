/**
 * Uses either the passed in optional data or the passed in default data.
 * @param defaultData Default data to return if no optional data is provided.
 * @param optData     Optional data.
 */
export const dataOrDefault = <T, U>(defaultData: T, optData?: U): T | U => optData ? optData : defaultData;