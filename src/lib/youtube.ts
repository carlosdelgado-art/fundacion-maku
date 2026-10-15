/**
 * Convierte distintos formatos de enlace de YouTube (video normal, youtu.be,
 * shorts, etc.) al formato "embed" que se puede mostrar dentro de un iframe.
 * Si ya es un link de embed, o no se reconoce el formato, se devuelve tal cual.
 */
export function toYouTubeEmbedUrl(
  url: string,
  options?: { autoplay?: boolean }
): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  const applyAutoplay = (embedUrl: string) => {
    if (!options?.autoplay) return embedUrl;
    try {
      const u = new URL(embedUrl);
      // El autoplay en navegadores solo funciona si el video empieza silenciado
      u.searchParams.set("autoplay", "1");
      u.searchParams.set("mute", "1");
      return u.toString();
    } catch {
      return embedUrl;
    }
  };

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id ? applyAutoplay(`https://www.youtube.com/embed/${id}`) : trimmed;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? applyAutoplay(`https://www.youtube.com/embed/${id}`) : trimmed;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/")[2];
        return id ? applyAutoplay(`https://www.youtube.com/embed/${id}`) : trimmed;
      }
      // Ya viene como /embed/... u otro formato soportado
      return applyAutoplay(trimmed);
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}
