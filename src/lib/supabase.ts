import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL;const key=import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured=Boolean(url&&key);
export const supabase=configured?createClient(url,key):null;
export type Profile={id:string;full_name:string;username:string;role:'teacher'|'student'};
export type Access={status:'active'|'expired'|'suspended'|'revoked';expires_at:string;starts_at:string};
