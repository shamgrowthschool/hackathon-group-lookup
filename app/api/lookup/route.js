const SHEET_ID = "1eRXiYkKc9zZsn9UxL-kuMVldnKDk7vBgbTbtQ-seWIQ";
const SHEET_NAME = "FinalList";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

export const dynamic = "force-dynamic";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  return rows;
}

function rowToRecord(headers, row) {
  return headers.reduce((record, header, index) => {
    record[header.trim().toLowerCase()] = String(row[index] || "").trim();
    return record;
  }, {});
}

export async function POST(request) {
  const { email } = await request.json().catch(() => ({}));
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return Response.json({ error: "Email is required." }, { status: 400 });
  }

  const sheetResponse = await fetch(CSV_URL, { cache: "no-store" });
  if (!sheetResponse.ok) {
    return Response.json({ error: "Could not read the group sheet." }, { status: 502 });
  }

  const csv = await sheetResponse.text();
  const rows = parseCsv(csv);
  const headers = rows[0] || [];
  const records = rows.slice(1).map(row => rowToRecord(headers, row));
  const match = records.find(record => normalizeEmail(record.email) === normalizedEmail);

  if (!match) {
    return Response.json({ found: false });
  }

  return Response.json({
    found: true,
    learner: {
      name: match.name || "",
      email: match.email || "",
      groupNo: match["group no"] || "",
      whatsappLink: match["whatsapp link"] || ""
    }
  });
}
