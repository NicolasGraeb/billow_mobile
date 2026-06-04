export type AuthorizedFetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.clone().json();
    if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
    if (Array.isArray(data?.errors)) return JSON.stringify(data.errors);
  } catch {
  }
  try {
    const text = await response.clone().text();
    if (text) return `${fallback} — ${text.slice(0, 300)}`;
  } catch {
  }
  return `${fallback} (${response.status})`;
}

export async function ensureOk(response: Response, fallback: string): Promise<Response> {
  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response, fallback), response.status);
  }
  return response;
}

export async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export async function requestJson<T>(
  fetchFn: AuthorizedFetch,
  input: RequestInfo,
  init?: RequestInit,
  errorMessage = "Request failed"
): Promise<T> {
  const response = await fetchFn(input, init);
  await ensureOk(response, errorMessage);
  return parseJson<T>(response);
}

export async function publicRequestJson<T>(
  input: RequestInfo,
  init?: RequestInit,
  errorMessage = "Request failed"
): Promise<T> {
  const response = await fetch(input, init);
  await ensureOk(response, errorMessage);
  return parseJson<T>(response);
}

export function parseArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as { content?: unknown; items?: unknown };
    if (Array.isArray(obj.content)) return obj.content as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}

export type PaginatedResult<T> = {
  items: T[];
  totalPages?: number;
  hasMore: boolean;
};

export function parsePaginated<T>(data: unknown, page: number, pageSize: number): PaginatedResult<T> {
  const items = parseArray<T>(data);
  let totalPages: number | undefined;

  if (data && typeof data === "object" && "totalPages" in data) {
    const tp = (data as { totalPages: unknown }).totalPages;
    if (typeof tp === "number") totalPages = tp;
  }

  const hasMore =
    typeof totalPages === "number" ? page + 1 < totalPages : items.length === pageSize;

  return { items, totalPages, hasMore };
}
