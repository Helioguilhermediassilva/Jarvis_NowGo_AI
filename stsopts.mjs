const token = process.env.NOTION_API_KEY;
const dbId = "1041e87b-1609-806f-af78-e9102e86e231";
const r = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
  headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" }
});
const j = await r.json();
const st = j.properties?.Status;
console.log("tipo:", st?.type);
const opts = st?.select?.options ?? st?.status?.options ?? [];
console.log("opções:", opts.map(o=>o.name));
