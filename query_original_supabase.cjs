const https = require('https');

const SUPABASE_URL = 'https://goretssbyqnezfrqrhsv.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvcmV0c3NieXFuZXpmcnFyaHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzI2NjAsImV4cCI6MjA4MDUwODY2MH0.FUtioMAmhbs5yRxu9KazEEMQpQ7OeKz4j01jk3Wzf20';

const tables = [
  'profiles',
  'user_roles',
  'transactions',
  'categories',
  'credit_cards',
  'investments',
  'goals',
  'subscription_plans',
  'admin_variable_costs',
  'push_subscriptions'
];

async function queryTable(table) {
  return new Promise((resolve) => {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=5`;
    const req = https.get(url, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ table, status: res.statusCode, count: Array.isArray(json) ? json.length : 0, data: json });
        } catch(e) {
          resolve({ table, status: res.statusCode, raw: data.substring(0, 100) });
        }
      });
    });
    req.on('error', (err) => resolve({ table, error: err.message }));
  });
}

async function run() {
  console.log('Testing queries against original production Supabase:', SUPABASE_URL);
  for (const t of tables) {
    const res = await queryTable(t);
    console.log(`Table [${t}]: status ${res.status}, count: ${res.count || 0}`);
    if (res.count > 0) {
      console.log('Sample row:', JSON.stringify(res.data[0]).substring(0, 200));
    } else if (res.data && res.data.message) {
      console.log('Message:', res.data.message);
    }
  }
}

run();
