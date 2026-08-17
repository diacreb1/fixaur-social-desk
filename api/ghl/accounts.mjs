export default async function handler(req,res){
 if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
 const token=process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
 const location=process.env.GHL_LOCATION_ID||'BZnQXrtMdvtRZgf3VVSb';
 if(!token) return res.status(503).json({error:'GHL_PRIVATE_INTEGRATION_TOKEN is not configured'});
 const response=await fetch(`https://services.leadconnectorhq.com/social-media-posting/${location}/accounts`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json','Version':'2021-07-28'}});
 return res.status(response.status).json(await response.json());
}
