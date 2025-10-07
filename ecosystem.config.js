module.exports = {
  apps: [{
    name: 'ozarx-api',
    script: './backend/server.js',
    cwd: '/var/www/ozarx',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/ozarx-api-error.log',
    out_file: '/var/log/pm2/ozarx-api-out.log',
    log_file: '/var/log/pm2/ozarx-api.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};







