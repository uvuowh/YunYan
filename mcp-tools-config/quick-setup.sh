#!/bin/bash

# 🚀 MCP 工具链智能配置脚本
# 自动检测环境并配置 MCP 工具

echo "🛠️ MCP 工具链智能配置"
echo "======================"
echo ""

# 检查系统要求
echo "🔧 检查系统要求..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js >= 16"
    exit 1
fi

NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -lt 16 ]; then
    echo "❌ Node.js 版本过低 ($NODE_VERSION)，需要 >= 16"
    exit 1
fi

echo "✅ Node.js 版本: $NODE_VERSION"
echo ""

# 🔍 智能环境检测
echo "🔍 检测开发环境..."

CURSOR_DETECTED=false
AUGMENT_DETECTED=false
VSCODE_DETECTED=false

# 检测 Cursor
if [ -d ".cursor" ] || command -v cursor &> /dev/null; then
    CURSOR_DETECTED=true
    echo "✅ 检测到 Cursor IDE"
fi

# 检测 Augment
if [ -d ".augment" ] || pgrep -f "augment" &> /dev/null; then
    AUGMENT_DETECTED=true
    echo "✅ 检测到 Augment 环境"
fi

# 检测 VSCode
if [ -d ".vscode" ] || command -v code &> /dev/null; then
    VSCODE_DETECTED=true
    echo "✅ 检测到 VSCode"
fi

echo ""

# 智能推荐配置选项
echo "🎯 配置选项:"

if [ "$CURSOR_DETECTED" = true ] && [ "$AUGMENT_DETECTED" = true ]; then
    echo "🔥 推荐: 5) 智能配置 (检测到 Cursor + Augment)"
elif [ "$CURSOR_DETECTED" = true ]; then
    echo "🔥 推荐: 1) Cursor IDE (已检测到)"
elif [ "$AUGMENT_DETECTED" = true ]; then
    echo "🔥 推荐: 2) Augment 环境 (已检测到)"
fi

echo "1) Cursor IDE"
echo "2) Augment 环境"
echo "3) 两者都配置"
echo "4) 仅验证现有配置"
echo "5) 智能配置 (自动选择检测到的环境)"
echo ""

# 智能默认选择
if [ "$CURSOR_DETECTED" = true ] && [ "$AUGMENT_DETECTED" = true ]; then
    DEFAULT_CHOICE=5
elif [ "$CURSOR_DETECTED" = true ]; then
    DEFAULT_CHOICE=1
elif [ "$AUGMENT_DETECTED" = true ]; then
    DEFAULT_CHOICE=2
else
    DEFAULT_CHOICE=4
fi

read -p "请输入选择 (1-5, 默认: $DEFAULT_CHOICE): " choice
choice=${choice:-$DEFAULT_CHOICE}

# 🔧 配置函数
configure_cursor() {
    echo "🎯 配置 Cursor IDE..."

    # 创建 .cursor 目录
    mkdir -p .cursor

    # 复制配置文件
    cp mcp-tools-config/cursor-configs/mcp.json .cursor/

    echo "✅ Cursor MCP 配置文件已复制到 .cursor/mcp.json"
    echo ""
    echo "📋 下一步:"
    echo "1. 重启 Cursor IDE"
    echo "2. (可选) 配置 Brave Search API Key"
    echo "3. 测试工具功能"
    echo ""
    echo "📚 详细指南: mcp-tools-config/cursor-setup-guide.md"
}

configure_augment() {
    echo "🔧 配置 Augment 环境..."
    echo ""

    # 提供配置选项
    echo "🎯 Augment 配置选项:"
    echo "1) 🤖 自动配置 (推荐) - 尝试自动检测并配置"
    echo "2) 📚 手动配置 - 提供详细指导"
    echo ""
    read -p "请选择配置方式 (1-2, 默认: 1): " augment_choice
    augment_choice=${augment_choice:-1}

    case $augment_choice in
        1)
            echo ""
            echo "🤖 启动自动配置..."
            if [ -f "mcp-tools-config/shared/augment-auto-config.sh" ]; then
                ./mcp-tools-config/shared/augment-auto-config.sh
            else
                echo "❌ 自动配置脚本不存在"
                echo "回退到手动配置..."
                configure_augment_manual
            fi
            ;;
        2)
            echo ""
            configure_augment_manual
            ;;
        *)
            echo "❌ 无效选择，使用默认自动配置"
            ./mcp-tools-config/shared/augment-auto-config.sh
            ;;
    esac
}

configure_augment_manual() {
    echo "📚 Augment 手动配置指南"
    echo ""
    echo "📋 配置步骤:"
    echo "1. 打开 Augment 设置面板 (点击齿轮图标)"
    echo "2. 找到 'MCP servers' 部分"
    echo "3. 按照指南添加 5 个 MCP 服务器"
    echo ""
    echo "📚 详细指南: mcp-tools-config/augment-setup-guide.md"
    echo "📄 配置模板: mcp-tools-config/augment-configs/settings-template.json"
    echo ""
    echo "💡 提示: 你也可以稍后运行自动配置脚本:"
    echo "   ./mcp-tools-config/shared/augment-auto-config.sh"
}

case $choice in
    1)
        echo ""
        configure_cursor
        ;;

    2)
        echo ""
        configure_augment
        ;;

    3)
        echo ""
        echo "🔄 配置两个环境..."
        echo ""
        configure_cursor
        echo ""
        configure_augment
        ;;

    4)
        echo ""
        echo "🔍 验证现有配置..."
        ./mcp-tools-config/shared/verify-tools.sh
        exit 0
        ;;

    5)
        echo ""
        echo "🤖 智能配置模式..."
        echo ""

        if [ "$CURSOR_DETECTED" = true ]; then
            configure_cursor
            echo ""
        fi

        if [ "$AUGMENT_DETECTED" = true ]; then
            configure_augment
            echo ""
        fi

        if [ "$CURSOR_DETECTED" = false ] && [ "$AUGMENT_DETECTED" = false ]; then
            echo "⚠️ 未检测到支持的环境"
            echo "请手动选择配置选项 (1-3)"
            exit 1
        fi
        ;;

    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🔑 API Key 配置 (可选):"
echo "1. 复制 API Keys 模板: cp mcp-tools-config/shared/api-keys-template.env .env"
echo "2. 编辑 .env 文件，填入你的 API Keys"
echo "3. 在配置文件中引用环境变量"
echo ""

echo "🔍 验证配置:"
echo "运行验证脚本: ./mcp-tools-config/shared/verify-tools.sh"
echo ""

echo "🎉 快速设置完成！"
echo ""
echo "📚 更多信息:"
echo "- 配置中心: mcp-tools-config/"
echo "- Cursor 指南: mcp-tools-config/cursor-setup-guide.md"
echo "- Augment 指南: mcp-tools-config/augment-setup-guide.md"
