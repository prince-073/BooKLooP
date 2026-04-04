import re
with open('tmp_downloaded.txt', 'r', encoding='utf-8') as f:
    content = f.read()
m = re.search(r'<script type="text/babel".*?>(.*?)</script>', content, re.DOTALL)
if m:
    with open('tmp_extracted_code.tsx', 'w', encoding='utf-8') as out:
        out.write(m.group(1))
    print("Found and extracted babel script. Length:", len(m.group(1)))
else:
    print("No babel script found.")
