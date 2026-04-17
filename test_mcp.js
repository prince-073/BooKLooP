const { spawn } = require('child_process');
const child = spawn('npx', ['@testsprite/testsprite-mcp@latest'], {
  env: { ...process.env, API_KEY: 'sk-user-bCTL62Qk_PSU...S9h4gtCFw5sVuhb-o5Hg' }, // Dummy key is fine just to list tools
  stdio: ['pipe', 'pipe', 'inherit']
});
child.stdout.on('data', (data) => {
  console.log(data.toString());
  process.exit(0);
});
const request = { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} };
child.stdin.write(JSON.stringify(request) + '\n');
