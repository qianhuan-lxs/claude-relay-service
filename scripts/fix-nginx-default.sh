#!/bin/bash

# 快速修复：禁用 Nginx 默认站点配置
# 使用方法: sudo bash scripts/fix-nginx-default.sh

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "=========================================="
echo "禁用 Nginx 默认站点配置"
echo "=========================================="
echo ""

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then 
    print_error "请使用 sudo 运行此脚本"
    exit 1
fi

# 检测操作系统
if [ -f /etc/redhat-release ]; then
    OS="centos"
    DEFAULT_CONF="/etc/nginx/conf.d/default.conf"
elif [ -f /etc/debian_version ]; then
    OS="debian"
    DEFAULT_CONF="/etc/nginx/sites-enabled/default"
else
    print_error "不支持的操作系统"
    exit 1
fi

print_info "检测到操作系统: $OS"

# 禁用默认配置
DISABLED=false

if [ "$OS" = "centos" ]; then
    # CentOS/RHEL
    if [ -f "$DEFAULT_CONF" ]; then
        print_info "发现默认配置: $DEFAULT_CONF"
        sudo mv "$DEFAULT_CONF" "${DEFAULT_CONF}.disabled" 2>/dev/null
        if [ $? -eq 0 ]; then
            print_success "已禁用默认配置"
            DISABLED=true
        else
            print_warning "禁用失败，可能已被禁用"
        fi
    else
        print_info "未找到默认配置文件（可能已被禁用）"
    fi
else
    # Debian/Ubuntu
    if [ -L "$DEFAULT_CONF" ]; then
        print_info "发现默认配置链接: $DEFAULT_CONF"
        sudo rm -f "$DEFAULT_CONF"
        if [ $? -eq 0 ]; then
            print_success "已删除默认配置链接"
            DISABLED=true
        fi
    elif [ -f "$DEFAULT_CONF" ]; then
        print_info "发现默认配置文件: $DEFAULT_CONF"
        sudo mv "$DEFAULT_CONF" "${DEFAULT_CONF}.disabled" 2>/dev/null
        if [ $? -eq 0 ]; then
            print_success "已禁用默认配置"
            DISABLED=true
        else
            print_warning "禁用失败，可能已被禁用"
        fi
    else
        print_info "未找到默认配置文件（可能已被禁用）"
    fi
fi

# 测试配置
print_info "测试 Nginx 配置..."
if sudo nginx -t; then
    print_success "Nginx 配置测试通过"
else
    print_error "Nginx 配置测试失败"
    exit 1
fi

# 重启 Nginx
if [ "$DISABLED" = "true" ]; then
    print_info "重启 Nginx..."
    if sudo systemctl restart nginx; then
        print_success "Nginx 已重启"
    else
        print_error "Nginx 重启失败"
        exit 1
    fi
fi

echo ""
print_success "=========================================="
print_success "修复完成！"
print_success "=========================================="
echo ""
print_info "现在访问 http://your-server-ip 应该显示您的应用"
print_info "如果仍然显示默认页面，请检查："
print_info "  1. 后端服务是否运行: npm run service:status"
print_info "  2. 端口 3000 是否监听: netstat -tlnp | grep 3000"
print_info "  3. Nginx 配置是否正确: sudo nginx -t"
echo ""

