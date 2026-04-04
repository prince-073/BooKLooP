const fs = require('fs');

async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/me/avatar', {
      method: 'POST',
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch (e) {
    console.error('Fetch error', e);
  }
}
run();
