const basicauthtoken= 'ZDc0MzRlMTUtMjc5Yi00ZmVlLWIzMjktYWU4NmM2MmE3YThlOndQZm5sU0lyNDR2NXJvR3c1UzYyZmhJYTRCcWkyMUxoM3czV2xRRzZtbjRYR3AyMGtMSDVEaDhiQWowRWFVYTE='
export default async function fetchDynamicPrice(sku) {
  const resp = await fetch(
    "https://adobeioruntime.net/api/v1/web/3676633-kiransampleapp-stage/default/FetchERPprice",
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicauthtoken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sku }) // 👈 send SKU in request body
    }
  );
  if (!resp.ok) {
    throw new Error(`Failed to fetch dynamic price: ${resp.status}`);
  }

  return resp.json();
}