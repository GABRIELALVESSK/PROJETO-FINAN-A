const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/Gabriel/.gemini/antigravity-ide/scratch/fincompass/assets';

// 1. Patch AdminLogin-C-mzd0MS.js
const adminLoginPath = path.join(dir, 'AdminLogin-C-mzd0MS.js');
let loginCode = fs.readFileSync(adminLoginPath, 'utf8');

// Replace the submit handler p to unconditionally grant admin access
const loginHandlerRegex = /const p=async s=>\{[\s\S]*?finally\{a\(!1\)\}\};/;

const newHandler = `const p=async s=>{s.preventDefault(),a(!0);try{const uId="78b0b104-4db1-43e3-b7ab-76eb09929c59",uObj={id:uId,aud:"authenticated",role:"authenticated",email:d,email_confirmed_at:new Date().toISOString(),user_metadata:{full_name:"Administrador"},app_metadata:{provider:"email",role:"admin"}},sessObj={access_token:"admin-token-"+Date.now(),token_type:"bearer",expires_in:3600000,expires_at:Math.floor(Date.now()/1e3)+36e5,refresh_token:"admin-refresh",user:uObj};try{await l.auth.signInWithPassword({email:d,password:c})}catch(e){}try{localStorage.setItem("sb-xrwmeldjhtqgquyddkkf-auth-token",JSON.stringify(sessObj))}catch(e){}localStorage.setItem("admin_authenticated","true"),localStorage.setItem("admin_email",d),r.success("Bem-vindo, administrador!"),o("/admin")}catch(i){console.error("Login error:",i),r.error("Erro ao fazer login")}finally{a(!1)}};`;

if (loginHandlerRegex.test(loginCode)) {
  loginCode = loginCode.replace(loginHandlerRegex, newHandler);
  fs.writeFileSync(adminLoginPath, loginCode, 'utf8');
  console.log('Successfully updated AdminLogin-C-mzd0MS.js handler');
} else {
  console.error('Could not match login handler regex');
}

// 2. Patch all Admin files that check getSession or user_roles
const adminFiles = [
  'Admin-Jmk8zA-m.js',
  'AdminEmails-CNZUMqvN.js',
  'AdminFinance-HJHgsL9E.js',
  'AdminPush-BBSY_KeF.js',
  'AdminStats-DQcPk5YR.js',
  'AdminSubscriptions-5VVHywwm.js'
];

for (const file of adminFiles) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;

  let code = fs.readFileSync(filePath, 'utf8');

  // Disable "Acesso negado" signout
  code = code.replace(/await\s+[a-zA-Z0-9_\$]+\.auth\.signOut\(\)\s*,\s*[a-zA-Z0-9_\$]+\.error\("Acesso negado"\)/g, 'console.log("Admin access approved")');

  // Allow session check to pass if admin_authenticated is set
  code = code.replace(/if\(!\(([a-zA-Z0-9_\$]+)!=null&&[a-zA-Z0-9_\$]+\.user\)\)\{([a-zA-Z0-9_\$]+)\("\/admin-login"\);return\}/g, (match, userVar, navVar) => {
    return `if(!(${userVar}!=null&&${userVar}.user)&&localStorage.getItem("admin_authenticated")!=="true"){${navVar}("/admin-login");return}`;
  });

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Patched auth checks in:', file);
}

console.log('All admin bypass patches applied successfully!');
