#!/bin/bash

# 完整的 Nginx 502 错误修复脚本

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
echo "Nginx 502 错误完整修复工具"
echo "=========================================="
echo ""

# 获取项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR" || {
    print_error "无法进入项目目录"
    exit 1
}

# 检测操作系统
if [ -f /etc/redhat-release ]; then
    OS="centos"
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_CONF_FILE="/etc/nginx/conf.d/claude-relay-service.conf"
elif [ -f /etc/debian_version ]; then
    OS="debian"
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
    NGINX_CONF_FILE="/etc/nginx/sites-available/claude-relay-service"
else
    print_error "不支持的操作系统"
    exit 1
fi

# 步骤 1: 检查后端服务
print_info "步骤 1/6: 检查后端服务..."
if npm run service:status &> /dev/null; then
    print_success "后端服务正在运行"
else
    print_warning "后端服务未运行，正在启动..."
    npm run service:start:daemon
    sleep 3
    if npm run service:status &> /dev/null; then
        print_success "后端服务已启动"
    else
        print_error "后端服务启动失败"
        exit 1
    fi
fi

# 测试本地连接
if command -v curl &> /dev/null; then
    if curl -s http://127.0.0.1:3000/health &> /dev/null; then
        print_success "本地连接测试成功"
    else
        print_error "本地连接测试失败，后端服务可能有问题"
        exit 1
    fi
fi
echo ""

# 步骤 2: 修复 .env 配置
print_info "步骤 2/6: 检查 .env 配置..."
if [ ! -f .env ]; then
    print_warning ".env 文件不存在，创建默认配置..."
    cat > .env << EOF
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
TRUST_PROXY=true
EOF
fi

# 确保配置正确
if ! grep -q "^HOST=0.0.0.0" .env 2>/dev/null && ! grep -q "^HOST=127.0.0.1" .env 2>/dev/null; then
    sed -i '/^HOST=/d' .env 2>/dev/null
    echo "HOST=0.0.0.0" >> .env
    print_success "HOST 已设置为 0.0.0.0"
fi

if ! grep -q "^PORT=3000" .env 2>/dev/null; then
    sed -i '/^PORT=\([^R]\|$\)/d' .env 2>/dev/null
    echo "PORT=3000" >> .env
    print_success "PORT 已设置为 3000"
fi

if ! grep -q "^TRUST_PROXY=true" .env 2>/dev/null; then
    echo "TRUST_PROXY=true" >> .env
    print_success "TRUST_PROXY 已设置"
fi
echo ""

# 步骤 3: 禁用冲突的 Nginx 配置
print_info "步骤 3/6: 处理 Nginx 配置冲突..."

# 禁用默认配置
if [ "$OS" = "debian" ]; then
    if [ -f /etc/nginx/sites-enabled/default ]; then
        sudo rm -f /etc/nginx/sites-enabled/default
        print_success "已禁用默认配置"
    fi
    
    # 禁用其他使用 server_name "_" 的配置
    for file in /etc/nginx/sites-enabled/*; do
        if [ -f "$file" ] && [ "$file" != "/etc/nginx/sites-enabled/claude-relay-service" ]; then
            if grep -q 'server_name\s\+_;' "$file" 2>/dev/null; then
                sudo rm -f "$file"
                print_info "已禁用冲突配置: $file"
            fi
        fi
    done
else
    if [ -f /etc/nginx/conf.d/default.conf ]; then
        sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.disabled 2>/dev/null || true
        print_success "已禁用默认配置"
    fi
    
    # 禁用其他使用 server_name "_" 的配置
    for file in /etc/nginx/conf.d/*.conf; do
        if [ -f "$file" ] && [ "$file" != "/etc/nginx/conf.d/claude-relay-service.conf" ]; then
            if grep -q 'server_name\s\+_;' "$file" 2>/dev/null; then
                sudo mv "$file" "${file}.disabled" 2>/dev/null || true
                print_info "已禁用冲突配置: $file"
            fi
        fi
    done
fi
echo ""

# 步骤 4: 确保我们的 Nginx 配置存在并正确
print_info "步骤 4/6: 检查 Nginx 配置文件..."

if [ ! -f "$NGINX_CONF_FILE" ]; then
    print_warning "Nginx 配置文件不存在，从项目复制..."
    if [ ! -f "$PROJECT_DIR/nginx.conf" ]; then
        print_error "项目根目录未找到 nginx.conf 文件"
        exit 1
    fi
    
    sudo cp "$PROJECT_DIR/nginx.conf" "$NGINX_CONF_FILE"
    
    # 创建符号链接（Debian/Ubuntu）
    if [ "$OS" = "debian" ]; then
        if [ ! -L "$NGINX_ENABLED_DIR/claude-relay-service" ]; then
            sudo ln -s "$NGINX_CONF_FILE" "$NGINX_ENABLED_DIR/claude-relay-service"
        fi
    fi
    
    print_success "Nginx 配置文件已创建"
fi

# 检查并更新 server_name（如果设置了域名）
if [ -n "$NGINX_DOMAIN" ] && [ "$NGINX_DOMAIN" != "_" ]; then
    print_info "更新 server_name 为: $NGINX_DOMAIN"
    sudo sed -i "s/server_name\s\+[^;]*;/server_name $NGINX_DOMAIN;/" "$NGINX_CONF_FILE"
    print_success "server_name 已更新"
fi

# 验证 proxy_pass 配置
if ! grep -q "proxy_pass http://127.0.0.1:3000" "$NGINX_CONF_FILE"; then
    print_error "proxy_pass 配置不正确"
    print_info "请检查配置文件: $NGINX_CONF_FILE"
    exit 1
fi

print_success "Nginx 配置文件检查通过"
echo ""

# 步骤 5: 测试 Nginx 配置
print_info "步骤 5/6: 测试 Nginx 配置..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    print_success "Nginx 配置测试通过"
else
    print_error "Nginx 配置测试失败"
    sudo nginx -t
    exit 1
fi
echo ""

# 步骤 6: 重启服务
print_info "步骤 6/6: 重启服务..."

# 重启后端服务（如果需要）
if ! curl -s http://127.0.0.1:3000/health &> /dev/null; then
    print_info "重启后端服务..."
    npm run service:restart:daemon
    sleep 3
fi

# 重启 Nginx
print_info "重启 Nginx..."
if sudo systemctl restart nginx; then
    print_success "Nginx 已重启"
else
    print_error "Nginx 重启失败"
    exit 1
fi

# 等待服务启动
sleep 2
echo ""

# 最终验证
print_info "最终验证..."
echo ""

# 检查服务状态
if npm run service:status &> /dev/null; then
    print_success "✓ 后端服务运行正常"
else
    print_error "✗ 后端服务未运行"
fi

# 测试本地连接
if command -v curl &> /dev/null; then
    if curl -s http://127.0.0.1:3000/health &> /dev/null; then
        print_success "✓ 本地连接正常"
    else
        print_error "✗ 本地连接失败"
    fi
fi

# 测试通过 Nginx
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "✓ 通过 Nginx 访问成功 (HTTP $HTTP_CODE)"
    else
        print_warning "✗ 通过 Nginx 访问返回: HTTP $HTTP_CODE"
        if [ "$HTTP_CODE" = "502" ]; then
            print_info "查看错误日志: sudo tail -20 /var/log/nginx/error.log"
        fi
    fi
fi

echo ""
print_success "=========================================="
print_success "修复完成！"
print_success "=========================================="
echo ""
print_info "如果仍然有 502 错误，请检查："
echo "1. Nginx 错误日志: sudo tail -f /var/log/nginx/error.log"
echo "2. 后端服务日志: tail -f logs/service.log"
echo "3. 运行诊断: npm run check:nginx"
echo ""

