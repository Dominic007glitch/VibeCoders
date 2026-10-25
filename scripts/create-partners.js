/** Execute apenas em ambiente confiável; nunca expor a service role em navegadores. */
import 'dotenv/config';import {createClient} from '@supabase/supabase-js';import {randomUUID} from 'node:crypto';import {createInterface} from 'node:readline/promises';
const url=process.env.VITE_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key||url.includes('SEU-PROJETO')){console.error('Configure .env antes de executar.');process.exit(1)}
const supabase=createClient(url,key,{auth:{persistSession:false}});
const rl=createInterface({input:process.stdin,output:process.stdout});
try{
 let {data:orgs,error:orgErr}=await supabase.from('organizations').select('id,name').limit(1);if(orgErr)throw orgErr;
 let orgId=orgs?.[0]?.id;
 if(!orgId){const {data,error}=await supabase.from('organizations').insert({name:'Minha Agência'}).select('id').single();if(error)throw error;orgId=data.id;}
 for(let i=1;i<=2;i++){
  console.log('\nSócio '+i);const username=(await rl.question('Nome de usuário (a-z, números, ponto, hífen): ')).trim().toLowerCase();const name=(await rl.question('Nome para exibição: ')).trim();const password=await rl.question('Senha forte (visível neste terminal; proteja sua tela): ');
  if(!/^[a-z0-9._-]{3,32}$/.test(username)||!name||password.length<12)throw new Error('Usuário inválido, nome vazio ou senha menor que 12 caracteres.');
  const {data:existing,error:e0}=await supabase.from('profiles').select('id').eq('username',username).maybeSingle();if(e0)throw e0;if(existing)throw new Error('Usuário já cadastrado: '+username);
  const internalEmail='agency-'+randomUUID()+'@example.invalid';
  const {data:created,error:e1}=await supabase.auth.admin.createUser({email:internalEmail,password,email_confirm:true,user_metadata:{display_name:name}});if(e1)throw e1;
  const id=created.user.id;
  const {error:e2}=await supabase.from('profiles').insert({id,username,display_name:name});if(e2)throw e2;
  const {error:e3}=await supabase.from('memberships').insert({org_id:orgId,user_id:id,role:'partner'});if(e3)throw e3;
  console.log('Conta criada: '+username);
 }
 console.log('\nPronto. Acesse o sistema com os nomes de usuário criados.');
}catch(e){console.error('Erro:',e.message);process.exitCode=1}finally{rl.close()}
