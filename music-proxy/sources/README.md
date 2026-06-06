# 音源文件目录

将 LX Music 音源 `.js` 文件放入此目录，代理服务启动时会自动加载。

## 获取音源

### 推荐：Huibq/keep-alive
```bash
# 克隆仓库
git clone https://github.com/Huibq/keep-alive.git temp
# 复制音源文件
cp temp/*.js ./sources/
rm -rf temp
```

### 备选：pdone/lx-music-source
```bash
git clone https://github.com/pdone/lx-music-source.git temp
cp temp/*.js ./sources/
rm -rf temp
```

## 支持的平台

常见音源覆盖的平台：
- 酷狗音乐
- QQ音乐
- 酷我音乐
- 咪咕音乐
- 网易云音乐
- 千千音乐
- 5sing

## 验证

启动代理后查看控制台输出，确认音源加载成功。
