const https = require('https');

const SUPABASE_URL = 'nhmvuufwxlwxofqqvvkq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obXZ1dWZ3eGx3eG9mcXF2dmtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMxNzI1MiwiZXhwIjoyMDg1ODkzMjUyfQ.nFaCyTD4hHPdQLNshXiO7ZIM04uMyMRnjRLeYPwAJJ8';

// Execute SQL via the Supabase RPC endpoint - we'll create a temporary function
const sql = `
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS original_amount NUMERIC(10, 2);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS transfer_direction TEXT CHECK (transfer_direction IS NULL OR transfer_direction IN ('sent', 'received'));
UPDATE public.transactions SET original_amount = CASE WHEN type = 'expense' THEN -amount ELSE amount END WHERE original_amount IS NULL;
`;

function postData(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: SUPABASE_URL,
            path: path,
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                'Prefer': 'return=representation',
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: responseData });
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('Attempting to add columns via Supabase...\n');

    // Method 1: Try using pg_net or direct SQL via RPC
    // First, let's try creating a helper function via RPC
    const createFnSQL = `
        CREATE OR REPLACE FUNCTION _temp_migrate()
        RETURNS TEXT LANGUAGE plpgsql AS $$
        BEGIN
            BEGIN
                ALTER TABLE public.transactions ADD COLUMN original_amount NUMERIC(10, 2);
            EXCEPTION WHEN duplicate_column THEN
                NULL;
            END;
            BEGIN
                ALTER TABLE public.transactions ADD COLUMN transfer_direction TEXT CHECK (transfer_direction IS NULL OR transfer_direction IN ('sent', 'received'));
            EXCEPTION WHEN duplicate_column THEN
                NULL;
            END;
            UPDATE public.transactions SET original_amount = CASE WHEN type = 'expense' THEN -amount ELSE amount END WHERE original_amount IS NULL;
            RETURN 'Migration complete';
        END;
        $$;
    `;

    // Try via the SQL endpoint (some Supabase instances expose this)
    console.log('Trying via RPC...');

    // First create the function
    const result1 = await postData('/rest/v1/rpc/_temp_migrate', {});
    console.log('RPC call result:', result1.status, result1.body);

    if (result1.status === 404) {
        console.log('\nThe RPC function does not exist yet.');
        console.log('\n========================================');
        console.log('MANUAL ACTION REQUIRED');
        console.log('========================================\n');
        console.log('Please go to the Supabase SQL Editor:');
        console.log('https://supabase.com/dashboard/project/nhmvuufwxlwxofqqvvkq/sql/new\n');
        console.log('And paste + run the following SQL:\n');
        console.log('---');
        console.log(`ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS original_amount NUMERIC(10, 2);`);
        console.log(`ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS transfer_direction TEXT CHECK (transfer_direction IS NULL OR transfer_direction IN ('sent', 'received'));`);
        console.log(`UPDATE public.transactions SET original_amount = CASE WHEN type = 'expense' THEN -amount ELSE amount END WHERE original_amount IS NULL;`);
        console.log('---');
    }
}

main().catch(console.error);
