export const convertToSpotifyEmbedUrl = (url) => {
  try {
    const parsed = new URL(url);

    // Validar que sea un episodio
    const segments = parsed.pathname.split("/");

    if (segments.length < 3 || segments[1] !== "episode") {
      throw new Error("URL no válida de episodio de Spotify");
    }

    const episodeId = segments[2];

    return `https://open.spotify.com/embed/episode/${episodeId}?utm_source=generator`;
  } catch (err) {
    console.error("Error al convertir URL:", err.message);
    return null;
  }
};
