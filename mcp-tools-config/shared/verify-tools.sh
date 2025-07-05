#!/bin/bash

# 🔍 MCP 工具链验证脚本
# 检查所有 MCP 工具的配置和可用性

echo "🛠️ MCP 工具链验证开始..."
echo "================================"

# 检查系统要求
echo "🔧 检查系统要求..."

# 检查 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js 版本: $NODE_VERSION"

    # 检查版本是否 >= 16
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 16 ]; then
        echo "✅ Node.js 版本符合要求 (>= 16)"
    else
        echo "⚠️ Node.js 版本过低，建议升级到 16 或更高版本"
    fi
else
    echo "❌ Node.js 未安装"
    exit 1
fi

# 检查 npx
if command -v npx &> /dev/null; then
    echo "✅ npx 可用"
else
    echo "❌ npx 不可用"
    exit 1
fi

echo ""

# 检查配置文件
echo "📁 检查配置文件..."

# Cursor 配置
if [ -f ".cursor/mcp.json" ]; then
    echo "✅ Cursor MCP 配置文件存在"

    # 验证 JSON 语法
    if command -v jq &> /dev/null; then
        if jq . .cursor/mcp.json > /dev/null 2>&1; then
            echo "✅ Cursor 配置文件 JSON 语法正确"
        else
            echo "❌ Cursor 配置文件 JSON 语法错误"
        fi
    fi
else
    echo "⚠️ Cursor MCP 配置文件不存在"
fi

# Shrimp 配置
if [ -f ".shrimp-task-manager/mcp-config.json" ]; then
    echo "✅ Shrimp MCP 配置文件存在"
else
    echo "⚠️ Shrimp MCP 配置文件不存在"
fi

echo ""

# 检查 MCP 工具可用性
echo "🔍 检查 MCP 工具可用性..."

TOOLS=(
    "mcp-feedback-enhanced"
    "mcp-shrimp-task-manager"
    "mcp-sequential-thinking"
    "@context7/mcp-server"
    "mcp-brave-search"
    "mcp-playwright"
)

for tool in "${TOOLS[@]}"; do
    echo "检查 $tool..."

    # 尝试获取工具信息
    if timeout 10s npx --yes "$tool" --version &> /dev/null 2>&1 || \
       timeout 10s npx --yes "$tool" --help &> /dev/null 2>&1; then
        echo "✅ $tool 可用"
    else
        echo "⚠️ $tool 可能需要首次下载或不兼容"
    fi
done

echo ""

# 检查数据目录
echo "📂 检查数据目录..."

DATA_DIR="/Users/uvu/YunYan/.shrimp-task-manager/data"
if [ -d "$DATA_DIR" ]; then
    echo "✅ Shrimp 数据目录存在: $DATA_DIR"

    # 检查权限
    if [ -w "$DATA_DIR" ]; then
        echo "✅ 数据目录可写"
    else
        echo "⚠️ 数据目录无写入权限"
    fi
else
    echo "⚠️ Shrimp 数据目录不存在，将在首次运行时创建"
fi

echo ""

# 检查 API Key 配置
echo "🔑 检查 API Key 配置..."

if [ -f ".cursor/mcp.json" ]; then
    if grep -q "YOUR_BRAVE_API_KEY_HERE" .cursor/mcp.json; then
        echo "⚠️ Brave Search API Key 需要配置"
        echo "   请访问 https://api.search.brave.com/ 获取 API Key"
        echo "   然后替换配置文件中的 YOUR_BRAVE_API_KEY_HERE"
    else
        echo "✅ Brave Search API Key 已配置"
    fi
fi

echo ""

# 总结
echo "📊 验证总结"
echo "================================"
echo "✅ 系统要求检查完成"
echo "✅ 配置文件检查完成"
echo "✅ 工具可用性检查完成"
echo ""
echo "🚀 下一步:"
echo "1. 如果使用 Cursor IDE，重启 Cursor 以加载 MCP 配置"
echo "2. 如果使用 Augment，在设置面板中配置 MCP 服务器"
echo "3. 配置 Brave Search API Key (可选)"
echo "4. 测试工具功能"
echo ""
echo "🎉 MCP 工具链验证完成！"
