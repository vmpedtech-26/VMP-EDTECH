import os
import re

web_dir = '/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/web/app'
components_dir = '/Users/matias/.gemini/antigravity/scratch/vmp-abril/apps/web/components'

# Regex to match alert('...'); and similar generic alerts
# We want to match: alert('Something'); or alert("Something");
alert_pattern = re.compile(r"alert\(['\"]([^'\"]+)['\"]\);")

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if file has any generic alerts
                if 'alert(' in content and 'error' in content:
                    # Let's be careful. We only want to replace alerts that are likely inside catch blocks.
                    # Since it's a bit complex to parse TS in Python, we can just replace all alerts that start with "Error"
                    # with the dynamic version, assuming 'error' variable is in scope (which it almost always is in these files).
                    # Actually, a safer regex:
                    
                    def replacer(match):
                        text = match.group(1)
                        if text.lower().startswith('error'):
                            return f"alert('{text}: ' + (error instanceof Error ? error.message : String(error)));"
                        return match.group(0)
                        
                    new_content = alert_pattern.sub(replacer, content)
                    
                    if new_content != content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated {filepath}")

process_directory(web_dir)
process_directory(components_dir)
print("Alerts updated.")
