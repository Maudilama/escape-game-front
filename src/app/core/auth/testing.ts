/** Fabrique un faux JWT lisible par decodeJwtPayload (la signature n'est pas vérifiée côté front). */
export function fakeJwt(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256' })}.${encode(payload)}.signature`;
}

export const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;