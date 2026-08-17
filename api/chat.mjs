export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 if(!process.env.MINIMAX_API_KEY) return res.status(503).json({error:'MINIMAX_API_KEY is not configured'});
 const {message,context}=req.body||{};
 const response=await fetch('https://api.minimax.io/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.MINIMAX_API_KEY}`},body:JSON.stringify({model:'MiniMax-M2.7',messages:[{role:'system',content:"You are Fixaur's social media manager. Help the owner improve the content queue. Be concise, specific, local to Saskatoon, Warman and Martensville, and never invent prices, guarantees, certifications, or competitor claims."},{role:'user',content:`Current context: ${JSON.stringify(context)}\nOwner request: ${message}`}],max_completion_tokens:800})});
 if(!response.ok) return res.status(502).json({error:'AI request failed'});
 const data=await response.json();return res.status(200).json({reply:data.choices?.[0]?.message?.content||'I could not produce a reply.'});
}
