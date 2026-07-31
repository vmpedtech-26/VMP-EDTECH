import os

api_client_path = '/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/web/lib/api-client.ts'
with open(api_client_path, 'r') as f:
    content = f.read()

content = content.replace('const API_URL = getApiUrl();', 'export const API_URL = getApiUrl();')

with open(api_client_path, 'w') as f:
    f.write(content)

# Update lib/api.ts
lib_api_path = '/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/web/lib/api.ts'
with open(lib_api_path, 'r') as f:
    content = f.read()

content = content.replace("const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';", "import { API_URL } from './api-client';")
with open(lib_api_path, 'w') as f:
    f.write(content)

# Update ContactSection.tsx
contact_path = '/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/web/components/landing/ContactSection.tsx'
with open(contact_path, 'r') as f:
    content = f.read()

if "import { API_URL }" not in content:
    content = content.replace("import { Send", "import { API_URL } from '@/lib/api-client';\nimport { Send")
    content = content.replace("const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';", "const apiUrl = `${API_URL}/api`;")
    
    with open(contact_path, 'w') as f:
        f.write(content)

# Update validar/[codigo]/page.tsx
validar_path = '/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/web/app/validar/[codigo]/page.tsx'
with open(validar_path, 'r') as f:
    content = f.read()

if "import { API_URL }" not in content:
    content = "import { API_URL } from '@/lib/api-client';\n" + content
    content = content.replace("const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';", "")
    
    with open(validar_path, 'w') as f:
        f.write(content)

print("API_URL standardized across the codebase.")
