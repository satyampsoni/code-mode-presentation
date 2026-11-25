export function redact(value: unknown): unknown {
  const secrets = [process.env.OPENAI_API_KEY].filter((s): s is string => !!s);
  const clean = (v: unknown): unknown => {
    if (typeof v === "string") {
      let t = v;
      for (const secret of secrets) t = t.split(secret).join("[REDACTED]");
      return t
        .replace(/Bearer\s+[\w.\-]+/gi, "Bearer [REDACTED]")
        .replace(/sk-[A-Za-z0-9_-]{12,}/g, "[REDACTED]");
    }
    if (Array.isArray(v)) return v.map(clean);
    if (v && typeof v === "object")
      return Object.fromEntries(
        Object.entries(v).map(([k, val]) => [
          k,
          /authorization|cookie|api.?key|password|secret|credential|token$/i.test(
            k,
          ) && !k.toLowerCase().includes("tokens")
            ? "[REDACTED]"
            : clean(val),
        ]),
      );
    return v;
  };
  return clean(value);
}
