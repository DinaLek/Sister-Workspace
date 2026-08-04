import warnings; warnings.filterwarnings('ignore')
from pypdf import PdfReader
import os

print("=== PDF page counts ===")
for name in ['proposal front page.pdf', 'Proposal blank page.pdf', 'proposal terms and comments.pdf']:
    path = f'tools/agents/proposals agent/resources/{name}'
    r = PdfReader(path)
    print(f'  {name}: {len(r.pages)} page(s)')

print()
print("=== All files in resources/ ===")
for f in sorted(os.listdir('tools/agents/proposals agent/resources')):
    print(f'  {f}')
