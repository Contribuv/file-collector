# 文件收集器 (File Collector)

<p align="center">
  <img src="logo.png" alt="文件收集器" width="200">
</p>

<p align="center">
  <strong>基于 Flask + SQLite 的多链接文件收集系统，专为飞牛 fnOS 打造</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.63-blue" alt="version">
  <img src="https://img.shields.io/badge/python-3.12-green" alt="python">
  <img src="https://img.shields.io/badge/flask-3.0.0-red" alt="flask">
  <img src="https://img.shields.io/badge/platform-fnOS-orange" alt="platform">
  <img src="https://img.shields.io/badge/license-MIT-lightgrey" alt="license">
</p>

---

## 简介

文件收集器是一个轻量级 Web 应用，管理员可在后台创建多个独立的文件收集链接，每个链接拥有独立的通行证、上传限制和有效期。上传者通过链接和通行证即可提交文件，非常适合团队协作、作业收集、资料汇总等场景。

**适用平台：** [飞牛 fnOS](https://www.fnnas.com/) Native 应用（.fpk 格式），也可 Docker 部署。

---

## 功能特性

### 核心功能

| 功能 | 说明 |
|------|------|
| 🔗 **多链接管理** | 创建/编辑/启用/禁用/删除，每个链接生成 8 位短 ID |
| 🔑 **独立通行证** | 每个链接独立的访问密码，Session 级别缓存 |
| 📏 **文件限制** | 自定义单文件大小上限（GB）和单次上传数量上限 |
| ⏱️ **有效期控制** | 设置链接过期时间，到期自动失效 |
| 📤 **拖拽上传** | 支持拖拽 + 点击上传，进度条实时显示 |
| 📋 **上传历史** | 上传者和管理员均可查看/下载已提交文件 |
| 🗑️ **文件管理** | 上传者可删除自己的记录，管理员支持批量删除 |
| 📦 **数据备份** | 一键下载/导入 SQLite 数据库，自动验证和备份旧库 |
| 🔒 **安全防护** | CSRF 保护、登录频率限制、通行证验证速率限制、会话安全 |
| 📱 **响应式 UI** | 桌面和移动端完美适配，微信浏览器自动提示跳转 |
| 🎨 **深度定制** | 自定义站点标题、登录提示、页尾文字、首页开关 |

### 管理员后台

- **仪表盘** — 总览统计（链接数/记录数/存储用量/活跃链接）+ 最近上传
- **收集链接** — 创建、编辑、启停、删除、一键复制分享链接
- **上传记录** — 分页浏览、按链接过滤、批量删除、下载文件
- **系统设置** — 账号密码修改、默认上传参数、通行证有效期、数据库备份恢复
- **系统信息** — 实时显示数据库路径、上传目录、监听端口

---

## 快速开始

### 方式一：fnOS 应用商店安装

1. 下载 `.fpk` 安装包
2. 在 fnOS 应用管理中点「手动安装」，选择 `.fpk` 文件
3. 安装向导中填写**上传文件存储目录**（绝对路径，如 `/vol1/收集文件`）
4. 安装完成后访问 `http://[NAS_IP]:5557/admin`

### 默认账户

| 用户名 | 密码 |
|--------|------|
| `admin` | `admin123` |

> ⚠️ 首次登录后请立即修改密码！

### 方式二：Docker 部署

```bash
docker run -d \
  --name file-collector \
  -p 5557:5557 \
  -v /your/data:/app/data \
  -v /your/uploads:/app/uploads \
  -e DATA_DIR=/app/data \
  -e UPLOAD_BASE=/your/uploads \
  file-collector:latest
```

---

## 技术架构

```
file-collector/
├── app/
│   ├── server/
│   │   ├── app.py              # Flask 主应用（路由、数据库、业务逻辑）
│   │   ├── templates/           # Jinja2 模板（10 个页面）
│   │   └── static/              # CSS、图片、图标
│   └── ui/                      # 桌面图标资源
├── cmd/
│   ├── main                     # 生命周期管理（start/stop/status/uninstall）
│   ├── install_init             # 安装前初始化
│   └── uninstall_callback       # 卸载后清理
├── config/
│   ├── privilege                # 运行权限配置
│   └── resource                 # 共享目录声明
├── wizard/
│   └── install                  # 安装向导配置
├── manifest                     # 应用元信息
├── logo.png                     # Logo
└── README.md
```

| 组件 | 技术 |
|------|------|
| Web 框架 | Flask 3.0.0 |
| 数据库 | SQLite（WAL 模式 + 外键约束） |
| 密码哈希 | Werkzeug Security |
| 生产部署 | Gunicorn（fnOS 内） |
| Python | 3.12+ |

---

## 环境变量

| 变量 | 用途 | 默认值 |
|------|------|--------|
| `DATA_DIR` | 数据库存储目录 | `$TRIM_DATA_SHARE_PATHS/data` |
| `UPLOAD_BASE` | 上传文件存储根目录 | `$TRIM_DATA_SHARE_PATHS/uploads` |
| `PORT` | 监听端口 | `5557` |
| `FLASK_DEBUG` | 调试模式 | `0` |

> **数据库持久化：** 使用 `TRIM_DATA_SHARE_PATHS`（飞牛官方应用文件目录），安装时自动分配，更新/重装不会丢失数据。

---

## API

### 健康检查

```bash
GET /api/status
```

响应示例：
```json
{
  "status": "running",
  "db_ok": true,
  "upload_dir_exists": true
}
```

---

## 更新日志

### v1.0.63
- 数据库改用 `TRIM_DATA_SHARE_PATHS` 飞牛官方应用文件路径
- 系统信息显示干净的原始路径

### v1.0.59–1.0.62
- 修复更新/重装丢数据 BUG，数据库路径改为应用自身目录
- 分享链接 URL 修正（collect → share）
- 系统设置增加备份提醒和上传目录授权说明

### v1.0.36
- 系统信息新增数据库路径实时显示
- 数据库存储遵循 fnOS 规范
- 上传目录配置改为安装时必填

---

## 开发者

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Contribuv">
        <b>豪子</b>
      </a>
    </td>
  </tr>
</table>

---

## License

MIT License

Copyright © 2025 [豪子](https://github.com/Contribuv/file-collector)
