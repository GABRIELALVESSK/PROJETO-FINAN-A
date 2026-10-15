import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xrwmeldjhtqgquyddkkf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MLVoBi3p4Snus09jpui1rQ_AHtHX2Xw';

console.log('Conectando ao Supabase:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

