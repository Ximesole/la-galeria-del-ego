// Devuelve los episodios más recientes del canal de YouTube (feed público, sin claves).
// Vercel guarda la respuesta en caché una hora, así que la lista se actualiza sola.
const CANAL = 'UCRmNIaaKjpEDZAI_C_lBusg';

const decode = (t) => t
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'");

module.exports = async (req, res) => {
  try {
    const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CANAL}`);
    if (!r.ok) throw new Error('feed ' + r.status);
    const xml = await r.text();
    const episodios = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
      id: (e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1],
      titulo: decode((e.match(/<title>([^<]*)<\/title>/) || [])[1] || ''),
      fecha: (e.match(/<published>([^<]+)<\/published>/) || [])[1] || '',
    })).filter((e) => e.id);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(episodios);
  } catch (err) {
    res.status(502).json({ error: 'No se pudo leer el canal' });
  }
};
