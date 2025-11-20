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
    print_info "步骤 5/5: 启动服务（守护进程模式）..."
    npm run service:start:daemon
    check_error "服务启动失败"
    print_success "服务已启动"
    echo ""
    
    # 显示服务状态
    print_info "检查服务状态..."
    sleep 2
    npm run service:status || true
    echo ""
    
    print_success "=========================================="
    print_success "部署完成！"
    print_success "=========================================="
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -n, --no-build      跳过前端构建"
    echo "  -d, --dir DIR       指定项目目录"
    echo ""
    echo "环境变量:"
    echo "  PROJECT_DIR         项目目录路径"
    echo "  BUILD_FRONTEND      是否构建前端 (true/false, 默认: true)"
    echo ""
    echo "示例:"
    echo "  $0                  # 完整部署（包括构建）"
    echo "  $0 -n               # 部署但不构建前端"
    echo "  $0 -d /path/to/project  # 指定项目目录"
}

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
        *)
            print_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 执行部署
deploy

