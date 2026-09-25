const port = (name: string, fallback: number) => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 1 || value > 65535) throw new Error(`${name} must be a TCP port`);
  return value;
};

export const staticPort = port('STATIC_PORT', 53222);
export const devPort = port('DEV_PORT', 4321);
if (staticPort === devPort) throw new Error('Browser test static and dev ports must differ');

export const STATIC = `http://127.0.0.1:${staticPort}`;
export const DEV = `http://127.0.0.1:${devPort}`;
