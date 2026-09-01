// Illustrative server-side submission pattern. Verify current IndexNow docs.
async function submitIndexNow({ host, key, keyLocation, urls }) {
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList: urls })
  });
  if (!response.ok) throw new Error(`IndexNow failed: ${response.status}`);
}
