import React,{createContext,useContext,useEffect,useState} from 'react';
import {supabase,configured} from '../lib/supabase';
const AuthContext=createContext(null);export const useAuth=()=>useContext(AuthContext);
export function AuthProvider({children}){
 const [session,setSession]=useState(null),[loading,setLoading]=useState(true),[membership,setMembership]=useState(null),[profile,setProfile]=useState(null);
 useEffect(()=>{let alive=true;supabase.auth.getSession().then(({data})=>{if(alive){setSession(data.session);setLoading(false)}});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>{if(alive)setSession(s)});return()=>{alive=false;subscription.unsubscribe()}},[]);
 useEffect(()=>{let active=true;if(!session?.user){setMembership(null);setProfile(null);return;}Promise.all([supabase.from('memberships').select('*').eq('user_id',session.user.id).eq('active',true).limit(1).maybeSingle(),supabase.from('profiles').select('*').eq('id',session.user.id).maybeSingle()]).then(([m,p])=>{if(active){setMembership(m.data||null);setProfile(p.data||null)}});return()=>{active=false}},[session?.user?.id]);
 async function login(username,password){const response=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username.trim().toLowerCase(),password})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Falha ao entrar');const {error}=await supabase.auth.setSession(result);if(error)throw error;}
 return <AuthContext.Provider value={{session,loading,membership,profile,orgId:membership?.org_id,login,logout:()=>supabase.auth.signOut(),configured}}>{children}</AuthContext.Provider>;
}
