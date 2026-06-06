# Kin Music Proxy — 部署指南

## 整体架构

```
用户浏览器
    │
    ▼
┌──────────────────────────────────────────┐
│ Nginx (:80)                              │
│                                           │
│ /api/music-source/* → 127.0.0.1:3456     │  ← Node.js 音乐代理 (PM2)
│ /api/*              → 127.0.0.1:5210     │  ← Java 后端
│ /*                  → /opt/kin-app/dist  │  ← Vue 静态文件
└──────────────────────────────────────────┘
```

## 第一步：服务器环境准备

```bash
# 安装 Node.js (如果还没有)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2 (进程守护)
sudo npm install -g pm2

# 安装 Nginx
sudo apt-get install -y nginx
```

## 第二步：下载音源文件

```bash
cd /opt/kin-app/music-proxy/sources

# 克隆 keep-alive 音源仓库
git clone --depth 1 https://github.com/Huibq/keep-alive.git temp
mv temp/*.js ./
rm -rf temp

# 验证：应该有多个 .js 文件
ls -la *.js
```

## 第三步：安装依赖 & 启动代理

```bash
cd /opt/kin-app/music-proxy
npm install

# 创建日志目录
mkdir -p logs

# PM2 启动
pm2 start ecosystem.config.cjs

# 验证
curl http://127.0.0.1:3456/api/health
# → {"status":"ok","sources":["酷狗音乐","QQ音乐",...],"sourceCount":5}
```

## 第四步：配置 Nginx

```bash
# 复制配置
sudo cp nginx.conf /etc/nginx/sites-available/kin-app

# 修改配置中的域名
sudo nano /etc/nginx/sites-available/kin-app
# 改 server_name your-domain.com → 你的实际域名

# 启用站点
sudo ln -s /etc/nginx/sites-available/kin-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # 删掉默认站点

# 测试配置
sudo nginx -t

# 重载
sudo nginx -s reload
```

## 第五步：部署前端

```bash
# 在本地或服务器上构建
cd /path/to/kin-app
npm run build
# 产出在 dist/ 目录

# 上传到服务器
scp -r dist/ user@your-server:/opt/kin-app/dist/

# 或直接在服务器上构建
cd /opt/kin-app
npm install
npm run build
```

## 日常运维

```bash
# 查看代理状态
pm2 status kin-music-proxy

# 查看日志
pm2 logs kin-music-proxy

# 重启
pm2 restart kin-music-proxy

# 开机自启
pm2 startup
pm2 save

# 更新音源
cd /opt/kin-app/music-proxy/sources
git -C keep-alive pull 2>/dev/null || git clone --depth 1 https://github.com/Huibq/keep-alive.git temp && mv temp/*.js ./ && rm -rf temp
pm2 restart kin-music-proxy
```

## 验证搜索

```bash
# 直接测代理
curl "http://127.0.0.1:3456/api/search?keyword=晴天"

# 经过 Nginx
curl "http://your-domain.com/api/music-source/search?keyword=晴天"

# 在前端搜索页面切换到"全网搜索"，输入关键词即可
```

## 安全注意事项

1. **限流**：代理已内置每 IP 60次/分钟的搜索限流
2. **防火墙**：确保 :3456 端口不对公网开放（只监听 127.0.0.1）
3. **HTTPS**：生产环境建议配置 SSL 证书（Let's Encrypt + Certbot）
