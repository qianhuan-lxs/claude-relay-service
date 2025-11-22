#!/bin/bash

# Nginx 502 错误诊断脚本

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
echo "Nginx 502 错误诊断工具"
echo "=========================================="
echo ""

# 1. 检查后端服务是否运行
print_info "1. 检查后端服务状态..."
if command -v npm &> /dev/null; then
    if npm run service:status &> /dev/null; then
        print_success "后端服务正在运行"
        npm run service:status
    else
        print_error "后端服务未运行或状态检查失败"
        echo ""
        print_info "尝试启动服务..."
        echo "  运行: npm run service:start:daemon"
    fi
else
    print_warning "未找到 npm 命令"
fi
echo ""

# 2. 检查端口 3000 是否被监听
print_info "2. 检查端口 3000 是否被监听..."
if command -v netstat &> /dev/null; then
    if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
        print_success "端口 3000 正在被监听"
        netstat -tlnp 2>/dev/null | grep ":3000 " || netstat -tln 2>/dev/null | grep ":3000 "
    else
        print_error "端口 3000 未被监听"
        print_info "后端服务可能未启动或监听在其他地址"
    fi
elif command -v ss &> /dev/null; then
    if ss -tlnp 2>/dev/null | grep -q ":3000 "; then
        print_success "端口 3000 正在被监听"
        ss -tlnp 2>/dev/null | grep ":3000 "
    else
        print_error "端口 3000 未被监听"
        print_info "后端服务可能未启动或监听在其他地址"
    fi
else
    print_warning "未找到 netstat 或 ss 命令，无法检查端口"
fi
echo ""

# 3. 测试本地连接
print_info "3. 测试本地连接 (127.0.0.1:3000)..."
if command -v curl &> /dev/null; then
    if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/health 2>/dev/null | grep -q "200"; then
        print_success "本地连接正常，后端服务可以访问"
        echo "   响应: $(curl -s http://127.0.0.1:3000/health)"
    else
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/health 2>/dev/null)
        if [ -z "$HTTP_CODE" ]; then
            print_error "无法连接到 127.0.0.1:3000"
            print_info "可能原因："
            print_info "  - 后端服务未启动"
            print_info "  - 后端服务监听在其他地址（检查 HOST 环境变量）"
            print_info "  - 防火墙阻止了本地连接"
        else
            print_warning "连接成功但返回状态码: $HTTP_CODE"
        fi
    fi
else
    print_warning "未找到 curl 命令，跳过连接测试"
fi
echo ""

# 4. 检查 Nginx 配置
print_info "4. 检查 Nginx 配置..."
if command -v nginx &> /dev/null; then
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        print_success "Nginx 配置语法正确"
    else
        print_error "Nginx 配置有误"
        sudo nginx -t
    fi
else
    print_warning "未找到 nginx 命令"
fi
echo ""

# 5. 检查 Nginx 错误日志
print_info "5. 检查 Nginx 错误日志（最近10行）..."
if [ -f /var/log/nginx/claude-relay-error.log ]; then
    print_info "错误日志内容："
    sudo tail -n 10 /var/log/nginx/claude-relay-error.log
elif [ -f /var/log/nginx/error.log ]; then
    print_info "通用错误日志内容："
    sudo tail -n 20 /var/log/nginx/error.log | grep -i "claude\|502\|upstream" || sudo tail -n 10 /var/log/nginx/error.log
else
    print_warning "未找到 Nginx 错误日志文件"
fi
echo ""

# 6. 检查 Nginx 状态
print_info "6. 检查 Nginx 服务状态..."
if systemctl is-active --quiet nginx; then
    print_success "Nginx 服务正在运行"
else
    print_error "Nginx 服务未运行"
    print_info "尝试启动: sudo systemctl start nginx"
fi
echo ""

# 7. 检查配置文件中的 proxy_pass 地址
print_info "7. 检查 Nginx 配置中的 proxy_pass 地址..."
NGINX_CONF=""
if [ -f /etc/nginx/conf.d/claude-relay-service.conf ]; then
    NGINX_CONF="/etc/nginx/conf.d/claude-relay-service.conf"
elif [ -f /etc/nginx/sites-available/claude-relay-service ]; then
    NGINX_CONF="/etc/nginx/sites-available/claude-relay-service"
elif [ -f /etc/nginx/sites-enabled/claude-relay-service ]; then
    NGINX_CONF="/etc/nginx/sites-enabled/claude-relay-service"
fi

if [ -n "$NGINX_CONF" ]; then
    print_info "找到配置文件: $NGINX_CONF"
    PROXY_PASS=$(sudo grep -E "proxy_pass\s+http" "$NGINX_CONF" | head -1)
    if [ -n "$PROXY_PASS" ]; then
        print_info "proxy_pass 配置: $PROXY_PASS"
        if echo "$PROXY_PASS" | grep -q "127.0.0.1:3000\|localhost:3000"; then
            print_success "proxy_pass 地址配置正确"
        else
            print_warning "proxy_pass 地址可能不正确，应该是 http://127.0.0.1:3000"
        fi
    else
        print_warning "未找到 proxy_pass 配置"
    fi
else
    print_warning "未找到 Nginx 配置文件"
fi
echo ""

# 8. 检查环境变量
print_info "8. 检查后端服务配置..."
if [ -f .env ]; then
    print_info "找到 .env 文件"
    if grep -q "HOST=" .env; then
        HOST_CONFIG=$(grep "HOST=" .env | cut -d'=' -f2)
        print_info "HOST 配置: $HOST_CONFIG"
        if [ "$HOST_CONFIG" != "0.0.0.0" ] && [ "$HOST_CONFIG" != "127.0.0.1" ]; then
            print_warning "HOST 配置为 $HOST_CONFIG，可能影响 Nginx 连接"
            print_info "建议设置为 0.0.0.0 或 127.0.0.1"
        fi
    fi
    if grep -q "PORT=" .env; then
        PORT_CONFIG=$(grep "PORT=" .env | cut -d'=' -f2)
        print_info "PORT 配置: $PORT_CONFIG"
        if [ "$PORT_CONFIG" != "3000" ]; then
            print_warning "PORT 配置为 $PORT_CONFIG，但 Nginx 配置指向 3000"
            print_info "需要更新 Nginx 配置或环境变量"
        fi
    fi
else
    print_info "未找到 .env 文件，使用默认配置"
fi
echo ""

# 总结和建议
echo "=========================================="
echo "诊断总结"
echo "=========================================="
echo ""
print_info "常见解决方案："
echo "1. 确保后端服务正在运行:"
echo "   npm run service:start:daemon"
echo ""
echo "2. 检查后端服务监听地址:"
echo "   确保 HOST=0.0.0.0 或 HOST=127.0.0.1"
echo ""
echo "3. 重启 Nginx:"
echo "   sudo systemctl restart nginx"
echo ""
echo "4. 查看详细错误日志:"
echo "   sudo tail -f /var/log/nginx/claude-relay-error.log"
echo "   或"
echo "   sudo tail -f /var/log/nginx/error.log"
echo ""
echo "5. 测试后端服务:"
echo "   curl http://127.0.0.1:3000/health"
echo ""

