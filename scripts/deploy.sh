#!/bin/bash

# Claude Relay Service 部署脚本
# 用于在服务器上快速部署更新

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
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

# 检查命令是否成功执行
check_error() {
    if [ $? -ne 0 ]; then
        print_error "$1"
        exit 1
    fi
}

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 默认项目目录（如果从 claude-code-easy 目录执行）
DEFAULT_PROJECT_DIR="$HOME/claude-code-easy/claude-relay-service"

# 检测项目目录
detect_project_dir() {
    # 如果当前目录是项目根目录
    if [ -f "package.json" ] && [ -d "web" ]; then
        PROJECT_DIR="$(pwd)"
        print_info "检测到项目目录: $PROJECT_DIR"
        return 0
    fi
    
    # 如果从 claude-code-easy 目录执行
    if [ -d "$DEFAULT_PROJECT_DIR" ] && [ -f "$DEFAULT_PROJECT_DIR/package.json" ]; then
        PROJECT_DIR="$DEFAULT_PROJECT_DIR"
        print_info "使用默认项目目录: $PROJECT_DIR"
        return 0
    fi
    
    # 尝试使用脚本所在目录的父目录
    if [ -f "$PROJECT_ROOT/package.json" ] && [ -d "$PROJECT_ROOT/web" ]; then
        PROJECT_DIR="$PROJECT_ROOT"
        print_info "使用脚本检测的项目目录: $PROJECT_DIR"
        return 0
    fi
    
    print_error "无法找到项目目录，请确保在正确的目录下执行脚本"
    print_info "或者设置 PROJECT_DIR 环境变量: export PROJECT_DIR=/path/to/claude-relay-service"
    return 1
}

# 检测操作系统类型
detect_os() {
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
        OS="unknown"
        NGINX_CONF_DIR=""
        NGINX_CONF_FILE=""
    fi
}

# 检查并安装 Nginx
install_nginx() {
    print_info "检查 Nginx 安装状态..."
    
    if command -v nginx &> /dev/null; then
        print_success "Nginx 已安装"
        nginx -v
        return 0
    fi
    
    print_warning "Nginx 未安装，开始安装..."
    
    detect_os
    if [ "$OS" = "unknown" ]; then
        print_error "不支持的操作系统，请手动安装 Nginx"
        return 1
    fi
    
    if [ "$OS" = "centos" ]; then
        if command -v yum &> /dev/null; then
            sudo yum install -y nginx
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y nginx
        else
            print_error "未找到包管理器 (yum/dnf)"
            return 1
        fi
    else
        sudo apt update
        sudo apt install -y nginx
    fi
    
    check_error "Nginx 安装失败"
    print_success "Nginx 安装完成"
    
    # 启动并设置开机自启
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    return 0
}

# 配置 Nginx
configure_nginx() {
    print_info "配置 Nginx 反向代理..."
    
    detect_os
    if [ "$OS" = "unknown" ]; then
        print_error "不支持的操作系统，无法自动配置 Nginx"
        return 1
    fi
    
    # 检查 nginx.conf 文件是否存在
    if [ ! -f "$PROJECT_DIR/nginx.conf" ]; then
        print_error "未找到 nginx.conf 配置文件"
        print_info "请确保项目根目录存在 nginx.conf 文件"
        return 1
    fi
    
    # 读取域名（如果设置了环境变量）
    if [ -z "$NGINX_DOMAIN" ]; then
        print_info "提示: 可以通过环境变量 NGINX_DOMAIN 设置域名"
        print_info "例如: export NGINX_DOMAIN=example.com"
        NGINX_DOMAIN="_"
    fi
    
    # 复制配置文件
    if [ "$OS" = "centos" ]; then
        print_info "复制配置文件到 $NGINX_CONF_FILE"
        sudo cp "$PROJECT_DIR/nginx.conf" "$NGINX_CONF_FILE"
        check_error "复制配置文件失败"
        
        # 替换域名
        if [ "$NGINX_DOMAIN" != "_" ]; then
            sudo sed -i "s/server_name _;/server_name $NGINX_DOMAIN;/" "$NGINX_CONF_FILE"
        fi
    else
        print_info "复制配置文件到 $NGINX_CONF_FILE"
        sudo cp "$PROJECT_DIR/nginx.conf" "$NGINX_CONF_FILE"
        check_error "复制配置文件失败"
        
        # 替换域名
        if [ "$NGINX_DOMAIN" != "_" ]; then
            sudo sed -i "s/server_name _;/server_name $NGINX_DOMAIN;/" "$NGINX_CONF_FILE"
        fi
        
        # 创建符号链接
        if [ ! -L "$NGINX_ENABLED_DIR/claude-relay-service" ]; then
            print_info "创建符号链接..."
            sudo ln -s "$NGINX_CONF_FILE" "$NGINX_ENABLED_DIR/claude-relay-service"
        fi
    fi
    
    # 测试配置
    print_info "测试 Nginx 配置..."
    if sudo nginx -t; then
        print_success "Nginx 配置测试通过"
    else
        print_error "Nginx 配置测试失败"
        return 1
    fi
    
    # 重启 Nginx
    print_info "重启 Nginx..."
    sudo systemctl restart nginx
    check_error "Nginx 重启失败"
    
    print_success "Nginx 配置完成"
    print_info "配置文件位置: $NGINX_CONF_FILE"
    if [ "$NGINX_DOMAIN" != "_" ]; then
        print_info "域名: $NGINX_DOMAIN"
    else
        print_warning "域名未设置，使用默认配置 (server_name _)"
        print_info "请手动编辑配置文件设置域名: $NGINX_CONF_FILE"
    fi
    
    return 0
}

# 主部署函数
deploy() {
    print_info "开始部署 Claude Relay Service..."
    echo ""
    
    # 检测项目目录
    if ! detect_project_dir; then
        exit 1
    fi
    
    # 进入项目目录
    print_info "进入项目目录: $PROJECT_DIR"
    cd "$PROJECT_DIR" || {
        print_error "无法进入项目目录: $PROJECT_DIR"
        exit 1
    }
    
    # 1. 拉取最新代码
    print_info "步骤 1/5: 拉取最新代码..."
    git pull
    check_error "Git pull 失败"
    print_success "代码更新完成"
    echo ""
    
    # 2. 安装前端依赖
    print_info "步骤 2/5: 安装前端依赖..."
    
    # 安装管理端前端依赖
    if [ -d "web/admin-spa" ]; then
        print_info "安装管理端前端依赖..."
        cd web/admin-spa
        if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
            npm install
            check_error "管理端前端依赖安装失败"
        else
            print_info "管理端前端依赖已是最新，跳过安装"
        fi
        cd "$PROJECT_DIR"
    fi
    
    # 安装客户端前端依赖
    if [ -d "web/client-spa" ]; then
        print_info "安装客户端前端依赖..."
        cd web/client-spa
        if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
            npm install
            check_error "客户端前端依赖安装失败"
        else
            print_info "客户端前端依赖已是最新，跳过安装"
        fi
        cd "$PROJECT_DIR"
    fi
    
    print_success "前端依赖安装完成"
    echo ""
    
    # 3. 构建前端（可选，如果需要）
    BUILD_FRONTEND=${BUILD_FRONTEND:-true}
    if [ "$BUILD_FRONTEND" = "true" ]; then
        print_info "步骤 3/5: 构建前端..."
        
        # 构建管理端前端
        if [ -d "web/admin-spa" ]; then
            print_info "构建管理端前端..."
            cd web/admin-spa
            npm run build
            check_error "管理端前端构建失败"
            cd "$PROJECT_DIR"
        fi
        
        # 构建客户端前端
        if [ -d "web/client-spa" ]; then
            print_info "构建客户端前端..."
            cd web/client-spa
            npm run build
            check_error "客户端前端构建失败"
            cd "$PROJECT_DIR"
        fi
        
        print_success "前端构建完成"
        echo ""
    else
        print_warning "跳过前端构建（设置 BUILD_FRONTEND=false 可跳过）"
        echo ""
    fi
    
    # 4. 停止服务
    print_info "步骤 4/5: 停止服务..."
    npm run service:stop || {
        print_warning "停止服务失败或服务未运行，继续执行..."
    }
    print_success "服务已停止"
    echo ""
    
    # 5. 启动服务（守护进程模式）
    print_info "步骤 5/6: 启动服务（守护进程模式）..."
    npm run service:start:daemon
    check_error "服务启动失败"
    print_success "服务已启动"
    echo ""
    
    # 6. 配置 Nginx（可选）
    if [ "$CONFIGURE_NGINX" = "true" ]; then
        print_info "步骤 6/6: 配置 Nginx 反向代理..."
        
        # 检查是否有 root 权限（通过 sudo）
        if ! sudo -n true 2>/dev/null; then
            print_warning "需要 sudo 权限来配置 Nginx"
            print_info "请输入密码以继续..."
        fi
        
        # 安装 Nginx（如果未安装）
        install_nginx || {
            print_warning "Nginx 安装/检查失败，跳过 Nginx 配置"
        }
        
        # 配置 Nginx
        configure_nginx || {
            print_warning "Nginx 配置失败，请手动配置"
        }
        
        echo ""
    else
        print_warning "跳过 Nginx 配置（使用 --nginx 参数可启用）"
        echo ""
    fi
    
    # 显示服务状态
    print_info "检查服务状态..."
    sleep 2
    npm run service:status || true
    echo ""
    
    # 显示访问信息
    print_success "=========================================="
    print_success "部署完成！"
    print_success "=========================================="
    echo ""
    print_info "访问地址："
    if [ "$CONFIGURE_NGINX" = "true" ] && [ "$NGINX_DOMAIN" != "_" ] && [ -n "$NGINX_DOMAIN" ]; then
        print_info "  Web界面: http://$NGINX_DOMAIN"
        print_info "  健康检查: http://$NGINX_DOMAIN/health"
    else
        print_info "  Web界面: http://localhost:3000"
        print_info "  健康检查: http://localhost:3000/health"
        if [ "$CONFIGURE_NGINX" = "true" ]; then
            print_warning "提示: 请编辑 Nginx 配置文件设置域名"
        fi
    fi
    echo ""
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -n, --no-build      跳过前端构建"
    echo "  -d, --dir DIR       指定项目目录"
    echo "  --nginx             配置 Nginx 反向代理"
    echo ""
    echo "环境变量:"
    echo "  PROJECT_DIR         项目目录路径"
    echo "  BUILD_FRONTEND      是否构建前端 (true/false, 默认: true)"
    echo "  CONFIGURE_NGINX     是否配置 Nginx (true/false, 默认: false)"
    echo "  NGINX_DOMAIN        设置 Nginx 域名 (例如: example.com)"
    echo ""
    echo "示例:"
    echo "  $0                  # 完整部署（包括构建）"
    echo "  $0 -n               # 部署但不构建前端"
    echo "  $0 --nginx          # 部署并配置 Nginx"
    echo "  $0 --nginx -d /path/to/project  # 指定目录并配置 Nginx"
    echo "  NGINX_DOMAIN=example.com $0 --nginx  # 设置域名并配置 Nginx"
}

# 默认值
CONFIGURE_NGINX=${CONFIGURE_NGINX:-false}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -n|--no-build)
            BUILD_FRONTEND=false
            shift
            ;;
        -d|--dir)
            PROJECT_DIR="$2"
            shift 2
            ;;
        --nginx)
            CONFIGURE_NGINX=true
            shift
            ;;
        *)
            print_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 执行部署
deploy

