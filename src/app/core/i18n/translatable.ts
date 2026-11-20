export interface Translatable {
  key: string;
  params?: Record<string, unknown>;
}

export function rawText(message: string): Translatable {
  return { key: 'common.message', params: { message } };
}