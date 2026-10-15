const https = require('https');
const URL_ = 'https://xrwmeldjhtqgquyddkkf.supabase.co';
const KEY = 'sb_publishable_MLVoBi3p4Snus09jpui1rQ_AHtHX2Xw';
const tables = ['profiles','user_roles','transactions','credit_cards','investments','admin_variable_costs','push_subscriptions','push_notification_log','push_notification_clicks'];
function q(t){return new Promise(r=>{https.get(`${URL_}/rest/v1/${t}?select=*&limit=3`,{headers:{apikey:KEY,Authorization:'Bearer '+KEY}},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>r({t,s:res.statusCode,d:d.slice(0,200)}))}).on('error',e=>r({t,s:'ERR',d:e.message}))})}
(async()=>{for(const t of tables){const x=await q(t);console.log(x.t,x.s,x.d)}})();
