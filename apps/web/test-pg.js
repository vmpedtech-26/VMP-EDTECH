const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
    connectionString: 'postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway'
});

async function main() {
    await client.connect();

    // Create a new password just in case
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('AccesoWeb2026', salt);

    console.log("Updating to AccesoWeb2026");

    // Make SURE email is clean, activo is true, and hash is fresh.
    await client.query(`
    UPDATE users 
    SET email = trim(email), activo = true, password_hash = $1 
    WHERE email LIKE '%administracion@vmp-edtech.com%';
  `, [hash]);

    const res = await client.query("SELECT email, activo FROM users WHERE email='administracion@vmp-edtech.com';");
    console.log("Updated User:", res.rows[0]);

    await client.end();
}

main().catch(console.error);
