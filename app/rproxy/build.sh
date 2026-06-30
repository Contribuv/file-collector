#!/bin/bash
# ============================================================
# fc-rproxy 编译脚本（飞牛 NAS 本地编译）
# 使用方法：chmod +x build.sh && ./build.sh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="${SCRIPT_DIR}/src"
OUT_DIR="${SCRIPT_DIR}"

ARCH=$(uname -m)
echo "当前架构: $ARCH"

if [ ! -d "$SRC_DIR" ]; then
    echo "ERROR: 找不到 src 目录: $SRC_DIR"
    exit 1
fi

cd "$SRC_DIR"

if ! command -v go &> /dev/null; then
    echo "ERROR: 未找到 go 命令，请先安装 Go"
    echo "  飞牛 NAS 可以通过应用中心安装 Go，或手动下载:"
    echo "  https://go.dev/dl/"
    exit 1
fi

echo "Go 版本: $(go version)"
echo "开始编译..."

BINARY_NAME="fc-rproxy"
if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
    BINARY_NAME="fc-rproxy-arm64"
elif [ "$ARCH" = "x86_64" ] || [ "$ARCH" = "amd64" ]; then
    BINARY_NAME="fc-rproxy-amd64"
fi

CGO_ENABLED=0 go build -ldflags="-s -w" -o "${OUT_DIR}/${BINARY_NAME}" .

chmod +x "${OUT_DIR}/${BINARY_NAME}"

echo ""
echo "✅ 编译完成!"
echo "   输出文件: ${OUT_DIR}/${BINARY_NAME}"
echo "   文件大小: $(du -h "${OUT_DIR}/${BINARY_NAME}" | cut -f1)"
