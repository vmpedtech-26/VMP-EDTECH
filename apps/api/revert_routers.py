import os
import glob

routers_dir = '/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/api/routers'
for filepath in glob.glob(os.path.join(routers_dir, '*.py')):
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace('strict_slashes=False, ', '')
    content = content.replace('strict_slashes=False', '')
    
    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Reverted {os.path.basename(filepath)}")
