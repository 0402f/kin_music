{
  "apps": [
    {
      "name": "kin-music-proxy",
      "script": "server.js",
      "cwd": "/opt/kin-app/music-proxy",
      "instances": 1,
      "exec_mode": "fork",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3456
      },
      "max_memory_restart": "256M",
      "error_file": "./logs/err.log",
      "out_file": "./logs/out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss",
      "autorestart": true,
      "max_restarts": 10,
      "restart_delay": 5000
    }
  ]
}
