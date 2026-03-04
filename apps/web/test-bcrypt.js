const { Client } = require('pg');
const bcrypt = require('bcryptjs'); // we can also use bcrypt

const client = new Client({
    connectionString: 'postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway'
});

async function main() {
    await client.connect();
    const res = await client.query("SELECT email, password_hash FROM users WHERE email = 'administracion@vmp-edtech.com';");

    const user = res.rows[0];
    console.log('User:', user.email);
    console.log('Hash in DB:', user.password_hash);

    const valid = await bcrypt.compare('pedro1973', user.password_hash);
    console.log('pwd matches pedro1973?:', valid);
    const valid2 = await bcrypt.compare('VmpAdmin2026!', user.password_hash);
    console.log('pwd matches VmpAdmin2026!?:', valid2);

    await client.end();
}

main().catch(console.error);
