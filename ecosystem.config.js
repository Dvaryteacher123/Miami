// PM2 (optional, recommended on a VPS):  npm i -g pm2 && pm2 start ecosystem.config.js && pm2 save && pm2 startup
// If the process ever dies, PM2 starts it again in 2s and every session is restored automatically.
module.exports = {
  apps: [
    {
      name: 'phonephix-bot',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      restart_delay: 2000,
      max_restarts: 1000,
      min_uptime: '20s',
      kill_timeout: 15000,
      // safety net: restart cleanly if memory ever balloons (set ~90% of your RAM)
      // max_memory_restart: '12G',
      env: { NODE_ENV: 'production' }
    }
  ]
};
