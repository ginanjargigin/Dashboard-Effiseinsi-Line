const BIN_ID = "6a45ea43da38895dfe201020";

const JSONBIN_BASE =
  `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export default async function handler(req, res) {
  const accessKey = process.env.PAPAN_ACCESS_KEY;

  if (!accessKey) {
    return res.status(500).json({
      message: "PAPAN_ACCESS_KEY belum dikonfigurasi di Vercel."
    });
  }

  try {
    // =========================
    // GET → mengambil data
    // =========================
    if (req.method === "GET") {
      const response = await fetch(
        `${JSONBIN_BASE}/latest`,
        {
          headers: {
            "X-Access-Key": accessKey
          }
        }
      );

      const data = await response.json();

      return res.status(response.status).json(data);
    }

    // =========================
    // PUT → menyimpan data
    // =========================
    if (req.method === "PUT") {
      const response = await fetch(
        JSONBIN_BASE,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Access-Key": accessKey
          },
          body: JSON.stringify(req.body)
        }
      );

      const data = await response.json();

      return res.status(response.status).json(data);
    }

    // =========================
    // Method lainnya ditolak
    // =========================
    return res.status(405).json({
      message: "Method tidak diizinkan."
    });

  } catch (error) {
    console.error("JSONBin proxy error:", error);

    return res.status(502).json({
      message: "Tidak dapat terhubung ke JSONBin."
    });
  }
}
