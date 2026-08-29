export default async function handler(req,res){
 if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
 const token=process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
 const location=process.env.GHL_LOCATION_ID||'BZnQXrtMdvtRZgf3VVSb';
 if(!token) return res.status(503).json({error:'GHL_PRIVATE_INTEGRATION_TOKEN is not configured'});
 try {
  const response=await fetch(`https://services.leadconnectorhq.com/social-media-posting/${location}/accounts`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json','Version':'2021-07-28'}});
  const payload = await response.json();
  if (response.ok && payload?.results?.accounts) {
   const now = Date.now();
   const accounts = payload.results.accounts;
   payload.results.accounts = accounts.filter((account) => !account.expire || new Date(account.expire).getTime() > now);
   payload.results.expiredAccounts = accounts.filter((account) => account.expire && new Date(account.expire).getTime() <= now).map(({id,name,platform,expire}) => ({id,name,platform,expire}));
  }
  return res.status(response.status).json(payload);
 } catch {
  return res.status(502).json({error:'Unable to reach GHL'});
 }
}
