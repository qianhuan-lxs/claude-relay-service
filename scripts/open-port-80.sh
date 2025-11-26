#!/bin/bash

# 开放服务器 80 端口的脚本

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
echo "开放服务器 80 端口"
echo "=========================================="
echo ""

# 检查是否有 root 权限
if [ "$EUID" -ne 0 ]; then 
    print_error "请使用 sudo 运行此脚本"
    print_info "使用方法: sudo bash scripts/open-port-80.sh"
    exit 1
fi

# 检测防火墙类型
detect_firewall() {
    if command -v firewall-cmd &> /dev/null; then
        FIREWALL="firewalld"
    elif command -v ufw &> /dev/null; then
        FIREWALL="ufw"
    elif command -v iptables &> /dev/null; then
        FIREWALL="iptables"
    else
        FIREWALL="none"
    fi
}

detect_firewall

print_info "检测到防火墙类型: $FIREWALL"
echo ""

# 方法 1: firewalld (CentOS/RHEL/Fedora)
if [ "$FIREWALL" = "firewalld" ]; then
    print_info "使用 firewalld 开放 80 端口..."
    
    # 检查 firewalld 是否运行
    if systemctl is-active --quiet firewalld; then
        print_success "firewalld 正在运行"
    else
        print_warning "firewalld 未运行，正在启动..."
        systemctl start firewalld
        systemctl enable firewalld
    fi
    
    # 开放 HTTP 服务（80端口）
    if firewall-cmd --permanent --query-service=http &> /dev/null; then
        print_info "HTTP 服务已配置"
    else
        firewall-cmd --permanent --add-service=http
        print_success "已添加 HTTP 服务"
    fi
    
    # 或者直接开放 80 端口
    if firewall-cmd --permanent --query-port=80/tcp &> /dev/null; then
        print_info "80 端口已开放"
    else
        firewall-cmd --permanent --add-port=80/tcp
        print_success "已开放 80 端口"
    fi
    
    # 重新加载配置
    firewall-cmd --reload
    print_success "firewalld 配置已重新加载"
    
    # 验证
    if firewall-cmd --query-service=http &> /dev/null || firewall-cmd --query-port=80/tcp &> /dev/null; then
        print_success "✓ 80 端口已成功开放"
    else
        print_error "✗ 80 端口开放失败"
    fi
    
    echo ""
    print_info "当前开放的端口和服务："
    firewall-cmd --list-all
    echo ""

# 方法 2: ufw (Ubuntu/Debian)
elif [ "$FIREWALL" = "ufw" ]; then
    print_info "使用 ufw 开放 80 端口..."
    
    # 检查 ufw 是否启用
    if ufw status | grep -q "Status: active"; then
        print_success "ufw 已启用"
    else
        print_warning "ufw 未启用，正在启用..."
        ufw --force enable
    fi
    
    # 开放 HTTP 服务（80端口）
    if ufw status | grep -q "80/tcp"; then
        print_info "80 端口已开放"
    else
        ufw allow 80/tcp
        print_success "已开放 80 端口"
    fi
    
    # 验证
    if ufw status | grep -q "80/tcp"; then
        print_success "✓ 80 端口已成功开放"
    else
        print_error "✗ 80 端口开放失败"
    fi
    
    echo ""
    print_info "当前防火墙规则："
    ufw status
    echo ""

# 方法 3: iptables
elif [ "$FIREWALL" = "iptables" ]; then
    print_info "使用 iptables 开放 80 端口..."
    
    # 检查规则是否已存在
    if iptables -C INPUT -p tcp --dport 80 -j ACCEPT &> /dev/null 2>&1; then
        print_info "80 端口规则已存在"
    else
        iptables -I INPUT -p tcp --dport 80 -j ACCEPT
        print_success "已添加 80 端口规则"
    fi
    
    # 保存规则（根据系统不同）
    if command -v iptables-save &> /dev/null; then
        if [ -f /etc/redhat-release ]; then
            # CentOS/RHEL
            service iptables save 2>/dev/null || iptables-save > /etc/sysconfig/iptables
        elif [ -f /etc/debian_version ]; then
            # Debian/Ubuntu
            if command -v netfilter-persistent &> /dev/null; then
                netfilter-persistent save
            elif command -v iptables-persistent &> /dev/null; then
                iptables-persistent save
            else
                print_warning "未找到持久化工具，规则可能在重启后丢失"
                print_info "安装持久化工具: apt install iptables-persistent"
            fi
        fi
    fi
    
    print_success "✓ 80 端口已开放"
    echo ""
    print_info "当前 iptables 规则（INPUT 链）："
    iptables -L INPUT -n --line-numbers | grep -E "80|tcp" || iptables -L INPUT -n | head -10
    echo ""

# 方法 4: 没有防火墙
else
    print_warning "未检测到防火墙，可能："
    print_info "1. 防火墙未安装"
    print_info "2. 防火墙已禁用"
    print_info "3. 使用云服务商的安全组（需要在控制台配置）"
    echo ""
    
    # 检查是否是云服务器
    if [ -f /sys/class/dmi/id/product_name ]; then
        PRODUCT=$(cat /sys/class/dmi/id/product_name 2>/dev/null)
        if echo "$PRODUCT" | grep -qi "aliyun\|tencent\|aws\|azure\|huawei"; then
            print_warning "检测到可能是云服务器，需要在云服务商控制台配置安全组："
            echo ""
            print_info "阿里云: 安全组 -> 入方向规则 -> 添加规则"
            print_info "  - 端口: 80"
            print_info "  - 协议: TCP"
            print_info "  - 授权对象: 0.0.0.0/0"
            echo ""
            print_info "腾讯云: 安全组 -> 入站规则 -> 添加规则"
            print_info "  - 端口: 80"
            print_info "  - 协议: TCP"
            print_info "  - 来源: 0.0.0.0/0"
            echo ""
            print_info "AWS: Security Groups -> Inbound Rules -> Add Rule"
            print_info "  - Port: 80"
            print_info "  - Protocol: TCP"
            print_info "  - Source: 0.0.0.0/0"
            echo ""
        fi
    fi
    
    # 测试端口是否可访问
    print_info "测试 80 端口是否可访问..."
    if command -v nc &> /dev/null; then
        if nc -z localhost 80 2>/dev/null; then
            print_success "本地 80 端口可访问"
        else
            print_warning "本地 80 端口不可访问，可能服务未启动"
        fi
    fi
fi

echo ""
print_success "=========================================="
print_success "配置完成！"
print_success "=========================================="
echo ""
print_info "验证方法："
echo "1. 从外部访问: curl http://your-server-ip"
echo "2. 检查端口监听: netstat -tlnp | grep 80"
echo "3. 检查 Nginx: sudo systemctl status nginx"
echo ""

