#!/bin/bash

# Claude Relay Service Nginx 快速配置脚本
# 使用方法: sudo bash scripts/setup-nginx.sh

set -e

echo "🚀 Claude Relay Service Nginx 配置脚本"
echo "========================================"
echo ""

# 检测操作系统
if [ -f /etc/redhat-release ]; then
    OS="centos"
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_CONF_FILE="$NGINX_CONF_DIR/claude-relay-service.conf"
elif [ -f /etc/debian_version ]; then
    OS="debian"
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
    NGINX_CONF_FILE="$NGINX_CONF_DIR/claude-relay-service"
else
    echo "❌ 不支持的操作系统，请手动配置"
    exit 1
fi

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请使用 sudo 运行此脚本"
    exit 1
fi

# 检查Nginx是否安装
if ! command -v nginx &> /dev/null; then
    echo "📦 检测到未安装 Nginx，正在安装..."
    if [ "$OS" = "centos" ]; then
        yum install -y nginx
    else
        apt update
        apt install -y nginx
    fi
    echo "✅ Nginx 安装完成"
fi

# 获取项目目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 读取域名
read -p "请输入你的域名（直接回车使用默认配置）: " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="_"
fi

# 复制配置文件
echo "📝 创建 Nginx 配置文件..."
cp "$PROJECT_DIR/nginx.conf" "$NGINX_CONF_FILE"

# 替换域名
if [ "$DOMAIN" != "_" ]; then
    sed -i "s/server_name _;/server_name $DOMAIN;/" "$NGINX_CONF_FILE"
fi

# 创建符号链接（仅 Debian/Ubuntu）
if [ "$OS" = "debian" ]; then
    if [ ! -L "$NGINX_ENABLED_DIR/claude-relay-service" ]; then
        ln -s "$NGINX_CONF_FILE" "$NGINX_ENABLED_DIR/claude-relay-service"
        echo "✅ 创建符号链接"
    fi
fi

# 测试配置
echo "🔍 测试 Nginx 配置..."
if nginx -t; then
    echo "✅ Nginx 配置测试通过"
else
    echo "❌ Nginx 配置测试失败，请检查配置文件"
    exit 1
fi

# 启动/重启 Nginx
echo "🔄 重启 Nginx..."
systemctl restart nginx
systemctl enable nginx

echo ""
echo "✅ Nginx 配置完成！"
echo ""
echo "📋 配置信息："
echo "   - 配置文件: $NGINX_CONF_FILE"
echo "   - 域名: $DOMAIN"
echo "   - 后端端口: 3000"
echo ""
echo "🌐 访问地址："
if [ "$DOMAIN" != "_" ]; then
    echo "   http://$DOMAIN"
else
    echo "   http://your-server-ip"
fi
echo ""
echo "📝 下一步："
echo "   1. 确保后端服务正在运行: npm run service:status"
echo "   2. 如果启用了防火墙，请开放80端口"
echo "   3. 访问 http://$DOMAIN 验证配置"
echo ""

