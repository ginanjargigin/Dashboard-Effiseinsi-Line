const JSONBIN_BASE = "/api/jsonbin";

export class JsonBinError extends Error {
  constructor(type, status = null, message = "") {
    super(message);
    this.name = "JsonBinError";
    this.type = type;
    this.status = status;
  }
}

function getJsonBinError(status, method = "GET") {
  if (status === 401) {
    return new JsonBinError(
      "ACCESS_KEY_INVALID",
      status,
      `${method} JSONBin gagal: Access Key tidak valid.`
    );
  }

  if (status === 403) {
    return new JsonBinError(
      "ACCESS_DENIED",
      status,
      `${method} JSONBin gagal: akses ke Bin ditolak.`
    );
  }

  if (status === 404) {
    return new JsonBinError(
      "BIN_NOT_FOUND",
      status,
      `${method} JSONBin gagal: Bin tidak ditemukan.`
    );
  }

  if (status === 429) {
    return new JsonBinError(
      "RATE_LIMIT",
      status,
      `${method} JSONBin gagal: terlalu banyak permintaan.`
    );
  }

  if ([500, 502, 503, 504].includes(status)) {
    return new JsonBinError(
      "SERVER_ERROR",
      status,
      `${method} JSONBin gagal: server JSONBin sedang bermasalah.`
    );
  }

  return new JsonBinError(
    "UNKNOWN_HTTP_ERROR",
    status,
    `${method} JSONBin gagal dengan HTTP ${status}.`
  );
}

export async function fetchDb() {
  let res;

  try {
    res = await fetch(JSONBIN_BASE);
  } catch (error) {
    throw new JsonBinError(
      "NETWORK_ERROR",
      null,
      "Tidak dapat terhubung ke server."
    );
  }

  if (!res.ok) {
    throw getJsonBinError(res.status, "GET");
  }

  try {
    const json = await res.json();
    return json.record || null;
  } catch (error) {
    throw new JsonBinError(
      "INVALID_RESPONSE",
      null,
      "Server memberikan respons yang tidak valid."
    );
  }
}

export async function saveDb(db) {
  let res;

  try {
    res = await fetch(JSONBIN_BASE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(db),
    });
  } catch (error) {
    throw new JsonBinError(
      "NETWORK_ERROR",
      null,
      "Tidak dapat terhubung ke server."
    );
  }

  if (!res.ok) {
    throw getJsonBinError(res.status, "PUT");
  }
}
