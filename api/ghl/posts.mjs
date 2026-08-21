export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 const token=process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
 const location=process.env.GHL_LOCATION_ID||'BZnQXrtMdvtRZgf3VVSb';
 if(!token) return res.status(503).json({error:'GHL_PRIVATE_INTEGRATION_TOKEN is not configured'});
 const {summary,mediaUrl,accountIds,scheduleDate,altText}=req.body||{};
 if(!summary||!Array.isArray(accountIds)||!accountIds.length) return res.status(400).json({error:'summary and accountIds are required'});
 const mediaType = /\.png(?:\?|$)/i.test(mediaUrl || '') ? 'image/png' : /\.gif(?:\?|$)/i.test(mediaUrl || '') ? 'image/gif' : 'image/jpeg';
 const baseBody={summary,type:'post',status:scheduleDate?'scheduled':'draft',...(scheduleDate?{scheduleDate}:{}),...(mediaUrl?{media:[{url:mediaUrl,type:mediaType,altText:altText||summary.slice(0,120)}]}:{})};
 try {
  const results=await Promise.all(accountIds.map(async (accountId)=>{
   const response=await fetch(`https://services.leadconnectorhq.com/social-media-posting/${location}/posts`,{method:'POST',headers:{Authorization:`Bearer ${token}`,Accept:'application/json','Content-Type':'application/json','Version':'v3'},body:JSON.stringify({...baseBody,accountIds:[accountId]})});
   const data=await response.json().catch(()=>({}));
   return {accountId,ok:response.ok,status:response.status,data};
  }));
  const failed=results.filter((x)=>!x.ok);
  if (failed.length) return res.status(failed.length===results.length?422:207).json({error:`GHL rejected ${failed.length} of ${results.length} connected accounts`,results});
  return res.status(201).json({success:true,message:'Created draft for all connected accounts',results});
 } catch {
  return res.status(502).json({error:'Unable to reach GHL'});
 }
}
