const getBackendBaseUrl = () => {
  const configuredBase = import.meta.env.VITE_MEDIA_BASE_URL?.trim();
  if (configuredBase) return configuredBase;

  return import.meta.env.VITE_GRAPHQL_URL?.trim()
    || import.meta.env.VITE_API_BASE_URL?.trim()
    || import.meta.env.VITE_CALENDAR_API_URL?.trim()
    || "";
};

export const resolveMediaUrl = (value?: string) => {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (
    trimmed.startsWith("http://")
    || trimmed.startsWith("https://")
    || trimmed.startsWith("data:")
    || trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const backendBase = getBackendBaseUrl();
  if (!backendBase) return trimmed;

  try {
    const baseUrl = new URL(backendBase, window.location.origin);
    return new URL(trimmed, `${baseUrl.origin}/`).toString();
  } catch {
    return trimmed;
  }
};
