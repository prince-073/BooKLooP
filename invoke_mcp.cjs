const { spawn } = require('child_process');
const shell = process.platform === 'win32' ? true : false;
const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(cmd, ['@testsprite/testsprite-mcp@latest'], {
  env: { ...process.env, API_KEY: 'sk-user-6w923PJfCVAYZlva918npMA4XzBVdNLwtolpGue6MLX5WGfBQuFat2VSI3hlK6LpVfzT9t4iaxN793dzy3LilSuhypNjsPbFp4xBu6axlVkVW0hVzTCmN542HB3qBtv4a7Q' }, 
  stdio: ['pipe', 'pipe', 'inherit'],
  shell: shell
});

let outputStr = '';
child.stdout.on('data', (data) => {
  const text = data.toString();
  outputStr += text;
  
  if (text.includes('"jsonrpc":"2.0"')) {
     const lines = outputStr.split('\n');
     for (const line of lines) {
       try {
         const parsed = JSON.parse(line);
         if (parsed.id === 1 || parsed.result) {
            console.log(JSON.stringify(parsed, null, 2));
            process.exit(0);
         }
       } catch(e) {}
     }
  }
});

const req = { 
  jsonrpc: '2.0', 
  id: 1, 
  method: 'tools/call', 
  params: { 
    name: 'testsprite_bootstrap', 
    arguments: { 
      localPort: 3000, 
      projectPath: "C:\\\\Users\\\\PRINCE\\\\OneDrive\\\\Desktop\\\\library", 
      testScope: "codebase", 
      type: "frontend" 
    } 
  } 
};
setTimeout(() => {
  child.stdin.write(JSON.stringify(req) + '\n');
}, 1000); 
