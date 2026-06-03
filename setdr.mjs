const token = process.env.NOTION_API_KEY;
const pageId = "34e1e87b-1609-81d8-9259-ff0c27ecd144";
const r = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
  body: JSON.stringify({ properties: { Status: { select: { name: "Negotiation" } } } })
});
const j = await r.json();
console.log("ok:", r.status, "novo status:", j.properties?.Status?.select?.name);
