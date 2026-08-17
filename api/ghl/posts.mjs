export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 const token=process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
 const location=process.env.GHL_LOCATION_ID||'BZnQXrtMdvtRZgf3VVSb';
 if(!token) return res.status(503).json({error:'GHL_PRIVATE_INTEGRATION_TOKEN is not configured'});
 const {summary,mediaUrl,accountIds,scheduleDate,altText}=req.body||{};
 if(!summary||!Array.isArray(accountIds)||!accountIds.length) return res.status(400).json({error:'summary and accountIds are required'});
 const body={accountIds,summary,status:scheduleDate?'scheduled':'draft',...(scheduleDate?{scheduleDate}:{}),...(mediaUrl?{media:[{url:mediaUrl,type:'image/jpeg',altText:altText||summary.slice(0,120)}]}:{})};
 const response=await fetch(`https://services.leadconnectorhq.com/social-media-posting/${location}/posts`,{method:'POST',headers:{Authorization:`Bearer ${token}`,Accept:'application/json','Content-Type':'application/json','Version':'2021-07-28'},body:JSON.stringify(body)});
 return res.status(response.status).json(await response.json());
}
