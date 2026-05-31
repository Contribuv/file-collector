# 飞牛nas_文件收集器.fpk (File Collector)

<p align="center">
  <img src="logo.png" alt="文件收集器" width="200">
</p>

<p align="center">
  <strong>基于 Flask + SQLite 的多链接文件收集系统，专为飞牛 fnOS 打造</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.1.4-blue" alt="version">
  <img src="https://img.shields.io/badge/python-3.12-green" alt="python">
  <img src="https://img.shields.io/badge/flask-3.0.0-red" alt="flask">
  <img src="https://img.shields.io/badge/platform-fnOS_|_x86_|_ARM-orange" alt="platform">
  <img src="https://img.shields.io/badge/license-MIT-lightgrey" alt="license">
</p>

---

## 简介

文件收集器是一个轻量级 Web 应用，管理员可在后台创建多个独立的收集链接，每个链接拥有独立的通行证、上传限制和有效期。每个链接自动生成**收集页**和**分享页**两种模式，收集者通过收集页上传文件，其他人通过分享页浏览和下载文件。非常适合团队协作、作业收集、资料汇总、文件分发等场景。

**适用平台：** [飞牛 fnOS](https://www.fnnas.com/) Native 应用（.fpk 格式），也可 Docker 部署。支持 **x86 / ARM / LoongArch / RISC-V** 全平台。

---

## 功能特性

### 核心功能

| 功能 | 说明 |
|------|------|
| 🔗 **多链接管理** | 创建/编辑/启用/禁用/删除，每个链接生成 8 位短 ID |
| 🔑 **独立通行证** | 每个链接独立的访问密码，Session 级别缓存 |
| 📤 **文件收集** | 拖拽 + 点击上传，进度条实时显示，支持批量上传 |
| 📥 **文件分享** | 同一链接生成分享页，其他人可浏览、下载和删除文件 |
| 📏 **文件限制** | 自定义单文件大小上限（GB）和单次上传数量上限 |
| ⏱️ **有效期控制** | 设置链接过期时间，到期自动失效 |
| 📋 **上传历史** | 收集者和管理员均可查看/下载已提交文件 |
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

## 收集与分享（双模式）

每个链接自动生成两个独立页面：

| 模式 | 地址 | 用途 | 功能 |
|------|------|------|------|
| 📤 **收集页** | `/collect/<link_id>` | 文件上传 | 拖拽上传、批量提交、进度显示、历史记录 |
| 📥 **分享页** | `/share/<link_id>` | 文件分发 | 浏览文件列表、下载文件、删除（可选） |

- 两个页面使用**同一通行证**，验证后在有效期（可配）内免重复输入
- 分享页不含上传功能，适合将已收集文件开放给团队查阅下载
- 管理员后台一键复制收集链接和分享链接，各带简易指引
- 微信浏览器访问时自动提示「在浏览器中打开」

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

### 收集页

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/collect/<link_id>` | 收集页面（通行证 + 上传） |
| `POST` | `/collect/<link_id>/verify` | 验证通行证 |
| `POST` | `/collect/<link_id>/logout` | 退出通行证 |
| `POST` | `/collect/<link_id>/upload` | 上传文件（multipart） |
| `GET` | `/collect/<link_id>/records` | 获取上传历史（JSON） |
| `GET` | `/collect/<link_id>/download/<record_id>` | 下载已上传文件 |
| `POST` | `/collect/<link_id>/delete_record/<record_id>` | 删除单条记录 |

### 分享页

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/share/<link_id>` | 分享页面（通行证 + 文件列表） |
| `POST` | `/share/<link_id>/verify` | 验证通行证 |
| `POST` | `/share/<link_id>/logout` | 退出通行证 |
| `GET` | `/share/<link_id>/records` | 获取文件列表（JSON） |
| `GET` | `/share/<link_id>/download/<record_id>` | 下载文件 |
| `POST` | `/share/<link_id>/delete_record/<record_id>` | 删除单条记录 |

---

## 更新日志

### v1.1.4
- 新增全平台支持：x86、ARM、LoongArch、RISC-V（`platform=all`）

### v1.1.3
- 清理冗余 CSS 代码，统一后台管理表格样式体系
- 上传记录页复用仪表盘 `dash-records` 样式

### v1.1.2
- 后台 UI 风格统一：上传记录页沿用仪表盘表格样式
- 修复移动端操作按钮大小不一致
- collect/share 页底部固定居中

### v1.1.1
- 统一后台 UI 风格，上传记录页沿用仪表盘表格样式
- 修复移动端操作按钮大小不一致
- collect/share 页底部固定居中

### v1.1.0
- 全面重新设计 UI，iOS 风格圆角卡片 + 毛玻璃导航栏
- 全局禁止缩放 + 安全区域适配，移动端体验如原生 APP

### v1.0.68
- 移动端上传记录改为简洁列表风格（参考"最近上传"）
- 文件名蓝色大标题 + 元信息用 · 分隔一行排列
- 移动端隐藏 checkbox 和操作列，界面干净清爽

### v1.0.67
- 重写上传记录表格布局，改用 `table-layout: auto` 自适应列宽
- 时间列保证完整显示不再截断，文件名列自动伸缩
- 移动端卡片布局重设计：文件名大标题 + 元信息网格 + 操作行分离
- 移除移动端 checkbox，界面更简洁

### v1.0.65
- 优化上传记录页列表宽度分配，修复时间列显示不全

### v1.0.64
- 优化后台管理界面操作按钮颜色区分（分享/收集/编辑/停用/启用/删除各具独立颜色）
- 修复多处 console.log 模板变量错误
- 优化表格响应式布局，修复移动端溢出问题
- 改进 settings-grid、dash-records、info-row 等多处排版
- 优化上传记录页列表宽度分配，修复时间列显示不全

### v1.0.63
- 数据库改用 `TRIM_DATA_SHARE_PATHS` 飞牛官方应用文件路径
- 系统信息显示干净的原始路径

### v1.0.59–1.0.62
- **新增文件分享功能** — 每个链接自动生成收集页和分享页双模式
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
