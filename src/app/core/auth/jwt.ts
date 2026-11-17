export interface JwtPayload {
  sub: string;
  email: string;
  roles?: string[];
  exp: number;
}

export function decodeJwtPayload(token: string): JwtPayload {
  const base64Url = token.split('.')[1] ?? '';
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload;
}