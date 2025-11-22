#!/bin/bash

# 快速修复 Nginx 502 错误的脚本

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
echo "Nginx 502 错误快速修复工具"
echo "=========================================="
echo ""

# 获取项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR" || {
    print_error "无法进入项目目录"
    exit 1
}

# 1. 检查并修复 .env 文件
print_info "步骤 1: 检查 .env 文件配置..."

if [ ! -f .env ]; then
    print_warning ".env 文件不存在，创建默认配置..."
    cat > .env << EOF
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
TRUST_PROXY=true
EOF
    print_success ".env 文件已创建"
else
    # 备份 .env 文件
    if [ ! -f .env.backup ]; then
        cp .env .env.backup
        print_info "已备份 .env 文件为 .env.backup"
    fi
    
    # 检查并修复 HOST 配置
    if ! grep -q "^HOST=" .env 2>/dev/null || grep "^HOST=" .env 2>/dev/null | grep -vq "HOST=0.0.0.0\|HOST=127.0.0.1"; then
        print_info "修复 HOST 配置..."
        # 删除旧的 HOST 行
        sed -i '/^HOST=/d' .env 2>/dev/null || sed -i.bak '/^HOST=/d' .env
        # 添加正确的 HOST 配置
        echo "HOST=0.0.0.0" >> .env
        print_success "HOST 已设置为 0.0.0.0"
    else
        print_success "HOST 配置正确"
    fi
    
    # 检查并修复 PORT 配置
    if ! grep -q "^PORT=" .env 2>/dev/null || ! grep "^PORT=" .env 2>/dev/null | grep -q "PORT=3000"; then
        print_info "修复 PORT 配置..."
        # 删除旧的 PORT 行（但保留 REDIS_PORT）
        sed -i '/^PORT=\([^R]\|$\)/d' .env 2>/dev/null || sed -i.bak '/^PORT=\([^R]\|$\)/d' .env
        # 添加正确的 PORT 配置
        echo "PORT=3000" >> .env
        print_success "PORT 已设置为 3000"
    else
        print_success "PORT 配置正确"
    fi
    
    # 确保 TRUST_PROXY 设置
    if ! grep -q "^TRUST_PROXY=" .env 2>/dev/null; then
        echo "TRUST_PROXY=true" >> .env
        print_success "已添加 TRUST_PROXY=true"
    fi
fi

echo ""

# 2. 重启后端服务
print_info "步骤 2: 重启后端服务以应用新配置..."
npm run service:restart:daemon
if [ $? -eq 0 ]; then
    print_success "后端服务已重启"
    sleep 3
else
    print_error "后端服务重启失败"
    exit 1
fi

echo ""

# 3. 验证服务
print_info "步骤 3: 验证服务状态..."
sleep 2

# 检查服务是否运行
if npm run service:status &> /dev/null; then
    print_success "后端服务正在运行"
else
    print_error "后端服务未运行"
    exit 1
fi

# 测试本地连接
if command -v curl &> /dev/null; then
    if curl -s http://127.0.0.1:3000/health &> /dev/null; then
        print_success "本地连接测试成功"
    else
        print_error "本地连接测试失败"
        exit 1
    fi
fi

echo ""

# 4. 重启 Nginx
print_info "步骤 4: 重启 Nginx..."
if sudo systemctl restart nginx; then
    print_success "Nginx 已重启"
else
    print_error "Nginx 重启失败"
    exit 1
fi

echo ""

# 5. 最终验证
print_info "步骤 5: 最终验证..."
sleep 2

if command -v curl &> /dev/null; then
    # 测试通过 Nginx 访问
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "通过 Nginx 访问成功！"
        print_success "HTTP 状态码: $HTTP_CODE"
    else
        print_warning "通过 Nginx 访问返回状态码: $HTTP_CODE"
        print_info "请检查 Nginx 错误日志: sudo tail -f /var/log/nginx/error.log"
    fi
fi

echo ""
print_success "=========================================="
print_success "修复完成！"
print_success "=========================================="
echo ""
print_info "如果问题仍然存在，请运行诊断脚本："
echo "  npm run check:nginx"
echo ""

