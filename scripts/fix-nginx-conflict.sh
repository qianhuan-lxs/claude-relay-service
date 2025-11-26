#!/bin/bash

# 修复 Nginx server_name 冲突的脚本

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
echo "修复 Nginx server_name 冲突"
echo "=========================================="
echo ""

# 检测操作系统
if [ -f /etc/redhat-release ]; then
    OS="centos"
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    DEFAULT_CONF="/etc/nginx/conf.d/default.conf"
elif [ -f /etc/debian_version ]; then
    OS="debian"
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
    DEFAULT_CONF="/etc/nginx/sites-enabled/default"
else
    print_error "不支持的操作系统"
    exit 1
fi

# 查找所有使用 server_name "_" 的配置文件
print_info "查找所有使用 server_name \"_\" 的配置文件..."

CONFLICT_FILES=()

if [ "$OS" = "centos" ]; then
    # CentOS/RHEL
    for file in /etc/nginx/conf.d/*.conf; do
        if [ -f "$file" ] && grep -q 'server_name\s\+_;' "$file" 2>/dev/null; then
            CONFLICT_FILES+=("$file")
        fi
    done
else
    # Debian/Ubuntu
    for file in /etc/nginx/sites-enabled/*; do
        if [ -f "$file" ] && grep -q 'server_name\s\+_;' "$file" 2>/dev/null; then
            CONFLICT_FILES+=("$file")
        fi
    done
fi

if [ ${#CONFLICT_FILES[@]} -eq 0 ]; then
    print_success "未发现 server_name \"_\" 冲突"
    exit 0
fi

print_warning "发现 ${#CONFLICT_FILES[@]} 个配置文件使用 server_name \"_\":"
for file in "${CONFLICT_FILES[@]}"; do
    echo "  - $file"
done
echo ""

# 查找我们的配置文件
OUR_CONF=""
if [ "$OS" = "centos" ]; then
    OUR_CONF="/etc/nginx/conf.d/claude-relay-service.conf"
else
    OUR_CONF="/etc/nginx/sites-enabled/claude-relay-service"
fi

print_info "我们的配置文件: $OUR_CONF"

# 处理冲突
if [ ${#CONFLICT_FILES[@]} -gt 1 ]; then
    print_warning "发现多个配置文件冲突，需要处理..."
    
    # 禁用默认配置
    if [ -f "$DEFAULT_CONF" ]; then
        print_info "禁用默认配置文件: $DEFAULT_CONF"
        if [ "$OS" = "debian" ]; then
            sudo rm -f "$DEFAULT_CONF"
        else
            sudo mv "$DEFAULT_CONF" "${DEFAULT_CONF}.disabled" 2>/dev/null || true
        fi
        print_success "默认配置已禁用"
    fi
    
    # 禁用其他冲突的配置（除了我们的）
    for file in "${CONFLICT_FILES[@]}"; do
        if [ "$file" != "$OUR_CONF" ] && [ -f "$file" ]; then
            print_info "禁用冲突配置文件: $file"
            if [ "$OS" = "debian" ]; then
                # 如果是符号链接，删除链接
                if [ -L "$file" ]; then
                    sudo rm -f "$file"
                else
                    # 如果是实际文件，移动到 disabled
                    sudo mv "$file" "${file}.disabled" 2>/dev/null || true
                fi
            else
                sudo mv "$file" "${file}.disabled" 2>/dev/null || true
            fi
        fi
    done
fi

# 确保我们的配置文件使用正确的 server_name
if [ -f "$OUR_CONF" ]; then
    print_info "检查我们的配置文件..."
    
    # 读取域名（如果设置了）
    if [ -n "$NGINX_DOMAIN" ] && [ "$NGINX_DOMAIN" != "_" ]; then
        print_info "使用环境变量中的域名: $NGINX_DOMAIN"
        DOMAIN="$NGINX_DOMAIN"
    else
        # 尝试从配置文件读取
        CURRENT_DOMAIN=$(sudo grep -E "server_name\s+" "$OUR_CONF" | head -1 | sed 's/.*server_name\s\+\([^;]*\);.*/\1/' | xargs)
        if [ "$CURRENT_DOMAIN" != "_" ] && [ -n "$CURRENT_DOMAIN" ]; then
            DOMAIN="$CURRENT_DOMAIN"
            print_info "使用配置文件中的域名: $DOMAIN"
        else
            print_warning "未设置域名，将使用 server_name _"
            DOMAIN="_"
        fi
    fi
    
    # 更新 server_name（如果需要）
    if [ "$DOMAIN" != "_" ]; then
        print_info "更新 server_name 为: $DOMAIN"
        sudo sed -i "s/server_name\s\+[^;]*;/server_name $DOMAIN;/" "$OUR_CONF"
        print_success "server_name 已更新"
    fi
else
    print_error "未找到我们的配置文件: $OUR_CONF"
    print_info "请先运行: npm run deploy:nginx"
    exit 1
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
print_info "重启 Nginx..."
if sudo systemctl restart nginx; then
    print_success "Nginx 已重启"
else
    print_error "Nginx 重启失败"
    exit 1
fi

echo ""
print_success "=========================================="
print_success "修复完成！"
print_success "=========================================="
echo ""
print_info "已禁用的配置文件："
if [ "$OS" = "debian" ]; then
    ls -la /etc/nginx/sites-enabled/*.disabled 2>/dev/null || echo "  无"
else
    ls -la /etc/nginx/conf.d/*.disabled 2>/dev/null || echo "  无"
fi
echo ""
print_info "当前生效的配置："
echo "  $OUR_CONF"
echo ""
print_info "测试访问："
if [ "$DOMAIN" != "_" ]; then
    echo "  curl http://$DOMAIN/health"
else
    echo "  curl http://localhost/health"
fi
echo ""

