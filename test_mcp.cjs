const { spawn } = require('child_process');
const shell = process.platform === 'win32' ? true : false;
const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(cmd, ['@testsprite/testsprite-mcp@latest'], {
  env: { ...process.env, API_KEY: 'sk-user-bCTL62Qk_PSU...S9h4gtCFw5sVuhb-o5Hg' },
  stdio: ['pipe', 'pipe', 'inherit'],
  shell: shell
});
child.stdout.on('data', (data) => {
  console.log(data.toString());
  process.exit(0);
});
const request = { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} };
child.stdin.write(JSON.stringify(request) + '\n');
