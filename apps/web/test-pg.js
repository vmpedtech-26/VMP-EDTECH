const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: 'postgresql://postgres:bngWhFAsXfcaZxWHVzLCDIbleiGMxAvK@nozomi.proxy.rlwy.net:29586/railway'
});

async function main() {
  await client.connect();

  // Unify password to VmpAdmin2026!
  const unifiedPassword = 'VmpAdmin2026!';
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(unifiedPassword, salt);

  console.log("Unifying passwords to:", unifiedPassword);

  // Update all admins
  await client.query(`
    UPDATE users 
    SET password_hash = $1 
    WHERE rol = 'SUPER_ADMIN';
  `, [hash]);

  // Also update 'admin@vmp.com' if it exists
  await client.query(`
    UPDATE users 
    SET password_hash = $1 
    WHERE email IN ('admin@vmp.com', 'admin@vmpservicios.com', 'administracion@vmp-edtech.com');
  `, [hash]);

  const res = await client.query("SELECT email FROM users WHERE rol = 'SUPER_ADMIN';");
  console.log("Updated Admins:", res.rows.map(r => r.email));

  await client.end();
}

main().catch(console.error);
