import {createClient} from '@supabase/supabase-js';
import {createHmac} from 'node:crypto';
const json=(res,status,obj)=>res.status(status).json(obj);
export default async function login(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Método não permitido'});
 const {username,password}=req.body||{};
 if(typeof username!=='string'||!/^[a-z0-9._-]{3,32}$/.test(username)||typeof password!=='string'||password.length>128||!password)return json(res,400,{error:'Credenciais inválidas'});
 const {VITE_SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:key,VITE_SUPABASE_ANON_KEY:anon,LOGIN_RATE_LIMIT_SECRET:secret}=process.env;
 if(!url||!key||!anon||!secret||secret.length<32)return json(res,503,{error:'Serviço de autenticação não configurado'});
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
 const fingerprint=createHmac('sha256',secret).update(ip+'|'+username).digest('hex');
 const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
  const {data:previous,error:dbErr}=await admin.from('login_attempts').select('*').eq('fingerprint',fingerprint).maybeSingle();
  if(dbErr)throw dbErr;
  if(previous?.blocked_until && new Date(previous.blocked_until).getTime()>Date.now())return json(res,429,{error:'Muitas tentativas. Tente novamente mais tarde.'});
  const {data:profile,error:profileErr}=await admin.from('profiles').select('id').eq('username',username).maybeSingle();
  if(profileErr)throw profileErr;
  let session=null;
  if(profile){
   const u=await admin.auth.admin.getUserById(profile.id);
   const email=u.data?.user?.email;
   if(email){const client=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});const result=await client.auth.signInWithPassword({email,password});session=result.data?.session||null;}
  }
  if(!session){
   const count=(previous?.failed_count||0)+1;
   const delay=count>=7?Math.min(3600,30*Math.pow(2,Math.min(count-7,7))):0;
   const {error:e}=await admin.from('login_attempts').upsert({fingerprint,failed_count:count,blocked_until:delay?new Date(Date.now()+delay*1000).toISOString():null,updated_at:new Date().toISOString()});
   if(e)throw e;
   return json(res,401,{error:'Usuário ou senha inválidos'});
  }
  const {data:memberships,error:me}=await admin.from('memberships').select('id').eq('user_id',profile.id).eq('active',true).limit(1);
  if(me)throw me;
  if(!memberships?.length)return json(res,403,{error:'Conta sem acesso ativo'});
  await admin.from('login_attempts').delete().eq('fingerprint',fingerprint);
  return json(res,200,{access_token:session.access_token,refresh_token:session.refresh_token});
 }catch(e){console.error('Falha de autenticação:',e?.message);return json(res,503,{error:'Autenticação temporariamente indisponível'});}
}
