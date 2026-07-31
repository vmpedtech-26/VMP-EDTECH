import os
import glob

routers_dir = '/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/api/routers'
for filepath in glob.glob(os.path.join(routers_dir, '*.py')):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Simple replacement for the empty case
    content = content.replace('router = APIRouter()', 'router = APIRouter(strict_slashes=False)')
    
    # For contact.py and others with existing args
    if 'router = APIRouter(prefix=' in content:
        content = content.replace('router = APIRouter(prefix=', 'router = APIRouter(strict_slashes=False, prefix=')
        
    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Updated {os.path.basename(filepath)}")
