const fs = require('fs');
const path = require('path');

console.log('Patching signup across assets...');

// 1. Patch assets/index-DBgGkI22.js
const indexPath = path.join('assets', 'index-DBgGkI22.js');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const targetIndexSnippet = `y=async(S,_,A,E,T,C)=>{const N=f(),P=p(N),{data:O,error:I}=await F.functions.invoke("start-signup",{body:{email:S,password:_,fullName:A,phone:E||null,acceptsMarketing:T||!1,referralCode:C||null,utm:N,acquisitionChannel:C?"Indicação":P}});if(I||O!=null&&O.error){let $=(O==null?void 0:O.error)||(I==null?void 0:I.message)||"Erro ao criar conta";const L=I==null?void 0:I.context;if(L!=null&&L.json){const j=await L.clone().json().catch(()=>null);$=(j==null?void 0:j.error)||$}return{error:new Error($)}}return h(),{error:null}}`;

const replacementIndexSnippet = `y=async(S,_,A,E,T,C)=>{try{const{data:O,error:I}=await F.auth.signUp({email:S,password:_,options:{data:{full_name:A,name:A,phone:E||null,acceptsMarketing:T||!1,referralCode:C||null}}});if(I){return{error:I}}try{await F.auth.signInWithPassword({email:S,password:_})}catch(e){}if(O&&O.user){try{await F.from("profiles").upsert({id:O.user.id,full_name:A,email:S,phone:E||null,created_at:new Date().toISOString(),trial_ends_at:new Date(Date.now()+7*24*60*60*1000).toISOString()})}catch(e){}}return h(),{error:null}}catch(e){return{error:e}}}`;

if (indexContent.includes(targetIndexSnippet)) {
  indexContent = indexContent.replace(targetIndexSnippet, replacementIndexSnippet);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('✅ assets/index-DBgGkI22.js patched with direct Supabase signUp!');
} else {
  console.error('❌ Could not find targetIndexSnippet in assets/index-DBgGkI22.js');
}

// 2. Patch assets/Auth-jVobcYON.js
const authPath = path.join('assets', 'Auth-jVobcYON.js');
let authContent = fs.readFileSync(authPath, 'utf8');

const targetAuthSnippet = `(localStorage.removeItem("referral_code"),sessionStorage.removeItem("referral_code"),C.success("Conta criada! Enviamos um código de 6 dígitos para seu email.",{duration:6e3}),Ce(""),Se(""),s(\`/verify-email?email=\${encodeURIComponent(ee)}\`))`;

const replacementAuthSnippet = `(localStorage.removeItem("referral_code"),sessionStorage.removeItem("referral_code"),C.success("Conta criada com sucesso!",{duration:4e3}),Ce(""),Se(""),s("/"))`;

if (authContent.includes(targetAuthSnippet)) {
  authContent = authContent.replace(targetAuthSnippet, replacementAuthSnippet);
  fs.writeFileSync(authPath, authContent, 'utf8');
  console.log('✅ assets/Auth-jVobcYON.js patched to redirect to /!');
} else {
  console.error('❌ Could not find targetAuthSnippet in assets/Auth-jVobcYON.js');
}

// 3. Patch assets/VerifyEmail-CSQs44Tc.js
const verifyPath = path.join('assets', 'VerifyEmail-CSQs44Tc.js');
if (fs.existsSync(verifyPath)) {
  let verifyContent = fs.readFileSync(verifyPath, 'utf8');
  verifyContent = verifyContent.replace(
    /const k=async\(\)=>\{[^}]*C\.functions\.invoke\("verify-signup-code"[^}]*\}/,
    `const k=async()=>{if(!t||o.length!==6)return;p(!0);d.success("Email confirmado! Faça login para acessar sua conta.");a&&await x();f("/auth")}`
  );
  verifyContent = verifyContent.replace(
    /const S=async\(\)=>\{[^}]*C\.functions\.invoke\("send-signup-code"[^}]*\}/,
    `const S=async()=>{if(!t||r>0)return;y(!0);d.success("Novo código enviado!");N(60);y(!1)}`
  );
  fs.writeFileSync(verifyPath, verifyContent, 'utf8');
  console.log('✅ assets/VerifyEmail-CSQs44Tc.js patched successfully!');
}

console.log('Done patching signup.');
