import type { RequestHandler } from "express";

export const handleIngest: RequestHandler = async (req, res) => {
  try {
    const { source, fileName, count, headers, rows } = req.body ?? {};
    if (!source || !Array.isArray(rows)) {
      return res.status(400).json({ message: "Invalid payload" });
    }
    const uniqueHeaders = Array.isArray(headers)
      ? Array.from(new Set(headers))
      : [];
    const limited = Array.isArray(rows) ? rows.slice(0, 3) : [];
    return res.json({
      message: `Received ${count ?? rows.length} rows for ${source}${fileName ? ` from ${fileName}` : ""}.`,
      headers: uniqueHeaders,
      sample: limited,
    });
  } catch (e) {
    return res.status(500).json({ message: (e as Error).message });
  }
};
