const fs = require('fs');
const path = require('path');
const https = require('https');

function request(url, options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    
    req.end();
  });
}

async function main() {
  const baseUrl = 'https://vmpedtech.app.n8n.cloud';
  
  console.log("Logging into n8n...");
  const loginRes = await request(`${baseUrl}/rest/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: "administracion@vmp-edtech.com",
    emailOrLdapLoginId: "administracion@vmp-edtech.com",
    password: "#5sEs_NhdYDbN5*"
  });
  
  if (loginRes.statusCode !== 200) {
    console.error("Login failed:", loginRes.statusCode, loginRes.data);
    process.exit(1);
  }
  
  let cookies = [];
  if (loginRes.headers['set-cookie']) {
    cookies = loginRes.headers['set-cookie'].map(c => c.split(';')[0]);
  }
  const authCookie = cookies.join('; ');
  console.log("Login successful.");
  
  const workflowsDir = path.join(__dirname, '../../n8n-workflows');
  const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const filePath = path.join(workflowsDir, file);
    let wfJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Remove tags to avoid format errors
    delete wfJson.tags;
    delete wfJson.id;
    
    console.log(`Uploading ${wfJson.name} (${file})...`);
    
    const uploadRes = await request(`${baseUrl}/rest/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      }
    }, wfJson);
    
    if (uploadRes.statusCode === 200 || uploadRes.statusCode === 201) {
      const data = JSON.parse(uploadRes.data);
      console.log(`✅ Success: ${wfJson.name} created with ID ${data.id}`);
      
      // Now activate it
      const actRes = await request(`${baseUrl}/rest/workflows/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Cookie': authCookie }
      }, { ...wfJson, active: true });
      
      if (actRes.statusCode === 200) {
        console.log(`✅ Activated successfully`);
      } else {
        console.error(`❌ Failed to activate:`, actRes.statusCode);
      }
    } else {
      console.error(`❌ Failed to upload ${wfJson.name}:`, uploadRes.statusCode, uploadRes.data);
    }
  }
}

main().catch(console.error);
