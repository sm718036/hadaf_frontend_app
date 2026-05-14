type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const DEFAULT_LOG_LEVEL: LogLevel = import.meta.env.DEV ? "debug" : "info";
const ENABLED =
  String(import.meta.env.VITE_ENABLE_APP_LOGS || (import.meta.env.DEV ? "true" : "false")) ===
  "true";
const CURRENT_LOG_LEVEL = resolveLogLevel(import.meta.env.VITE_APP_LOG_LEVEL);

function resolveLogLevel(value: string | undefined): LogLevel {
  if (!value) {
    return DEFAULT_LOG_LEVEL;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "debug" ||
    normalized === "info" ||
    normalized === "warn" ||
    normalized === "error"
  ) {
    return normalized;
  }

  return DEFAULT_LOG_LEVEL;
}

function shouldLog(level: LogLevel) {
  return ENABLED && LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL];
}

function sanitize(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => {
        if (
          key.toLowerCase().includes("password") ||
          key.toLowerCase().includes("token") ||
          key.toLowerCase().includes("secret")
        ) {
          return [key, "[redacted]"];
        }

        return [key, sanitize(entryValue)];
      }),
    );
  }

  return value;
}

function write(level: LogLevel, event: string, meta?: Record<string, unknown>) {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...(meta ? { meta: sanitize(meta) } : {}),
  };

  if (level === "error") {
    console.error(payload);
    return;
  }

  if (level === "warn") {
    console.warn(payload);
    return;
  }

  console.log(payload);
}

export const logger = {
  debug: (event: string, meta?: Record<string, unknown>) => write("debug", event, meta),
  info: (event: string, meta?: Record<string, unknown>) => write("info", event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => write("warn", event, meta),
  error: (event: string, meta?: Record<string, unknown>) => write("error", event, meta),
};
