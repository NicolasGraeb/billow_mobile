import type { ChatMessage } from './types';

const parseTimestamp = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const compareMessages = (a: ChatMessage, b: ChatMessage) => {
  const timeA = parseTimestamp(a.created_at);
  const timeB = parseTimestamp(b.created_at);

  if (timeA !== null && timeB !== null && timeA !== timeB) {
    return timeA - timeB;
  }

  if (timeA !== null && timeB === null) {
    return -1;
  }

  if (timeA === null && timeB !== null) {
    return 1;
  }

  const textCompare = a.created_at.localeCompare(b.created_at);
  if (textCompare !== 0) {
    return textCompare;
  }

  return a.id - b.id;
};

