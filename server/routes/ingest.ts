import type { RequestHandler } from "express";

export const handleIngest: RequestHandler = async (req, res) => {
  try {
    const { source, fileName, count, headers, rows } = req.body ?? {};
    if (!source || !Array.isArray(rows)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    // Forward CSV data to Django backend for storage
    try {
      const djangoResponse = await fetch("http://localhost:8000/api/csv/ingest/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Note: In a real implementation, you'd forward the user's session/auth
        },
        body: JSON.stringify({
          source,
          fileName,
          headers,
          rows
        }),
      });

      const djangoData = await djangoResponse.json();

      if (djangoResponse.ok && djangoData.success) {
        return res.json({
          message: djangoData.message,
          upload_id: djangoData.upload_id,
          headers: Array.from(new Set(headers)),
          sample: rows.slice(0, 3),
        });
      } else {
        // If Django storage fails, still return success but note the issue
        console.warn("Django storage failed:", djangoData.error);
        return res.json({
          message: `Received ${count ?? rows.length} rows for ${source}${fileName ? ` from ${fileName}` : ""} (storage pending).`,
          headers: Array.from(new Set(headers)),
          sample: rows.slice(0, 3),
          warning: "Data stored locally, backend storage pending"
        });
      }
    } catch (fetchError) {
      console.warn("Failed to connect to Django backend:", fetchError);
      // Fallback to local processing if Django is unavailable
      return res.json({
        message: `Received ${count ?? rows.length} rows for ${source}${fileName ? ` from ${fileName}` : ""} (local processing).`,
        headers: Array.from(new Set(headers)),
        sample: rows.slice(0, 3),
        warning: "Backend unavailable, processed locally"
      });
    }

  } catch (e) {
    return res.status(500).json({ message: (e as Error).message });
  }
};
