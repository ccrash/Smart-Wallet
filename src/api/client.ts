/** Generates a short random alphanumeric ID. Not cryptographically secure — fine for mock data. */
export const generateId = (): string => Math.random().toString(36).slice(2, 11)
