#!/bin/bash

# 🤖 Augment 自动配置脚本
# 尝试自动检测并配置 Augment 的 MCP 服务器

echo "🤖 Augment 自动配置工具"
echo "======================"
echo ""

# 获取当前工作目录
CURRENT_DIR=$(pwd)

# 查找 Augment 设置文件的可能位置
POSSIBLE_PATHS=(
    "$HOME/.config/augment/settings.json"
    "$HOME/Library/Application Support/augment/settings.json" 
    "$HOME/.augment/settings.json"
    ".augment/settings.json"
    "$HOME/AppData/Roaming/augment/settings.json"  # Windows
    "$HOME/snap/augment/current/.config/augment/settings.json"  # Snap
)

AUGMENT_SETTINGS=""

echo "🔍 搜索 Augment 设置文件..."
for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -f "$path" ]; then
        AUGMENT_SETTINGS="$path"
        echo "✅ 找到设置文件: $path"
        break
    else
        echo "   检查: $path (不存在)"
    fi
done

if [ -z "$AUGMENT_SETTINGS" ]; then
    echo ""
    echo "❌ 未找到 Augment 设置文件"
    echo ""
    echo "📋 可能的原因:"
    echo "1. Augment 未安装或未运行过"
    echo "2. 设置文件在非标准位置"
    echo "3. 权限问题"
    echo ""
    echo "🔧 手动配置步骤:"
    echo "1. 启动 Augment"
    echo "2. 打开设置面板 (⚙️ 齿轮图标)"
    echo "3. 找到 'MCP servers' 部分"
    echo "4. 按照指南手动添加服务器"
    echo ""
    echo "📚 详细指南: mcp-tools-config/augment-setup-guide.md"
    exit 1
fi

echo ""
echo "📄 分析现有配置..."

# 检查文件是否可读写
if [ ! -r "$AUGMENT_SETTINGS" ]; then
    echo "❌ 无法读取设置文件: $AUGMENT_SETTINGS"
    exit 1
fi

if [ ! -w "$AUGMENT_SETTINGS" ]; then
    echo "❌ 无法写入设置文件: $AUGMENT_SETTINGS"
    echo "请检查文件权限或以管理员身份运行"
    exit 1
fi

# 备份原设置
BACKUP_FILE="$AUGMENT_SETTINGS.backup.$(date +%Y%m%d_%H%M%S)"
cp "$AUGMENT_SETTINGS" "$BACKUP_FILE"
echo "✅ 已备份原设置: $BACKUP_FILE"

# 检查是否已有 MCP 配置
if grep -q "mcpServers" "$AUGMENT_SETTINGS"; then
    echo "⚠️ 检测到现有 MCP 服务器配置"
    echo ""
    echo "当前配置的服务器:"
    grep -A 2 '"name"' "$AUGMENT_SETTINGS" | grep '"name"' | sed 's/.*"name": *"\([^"]*\)".*/  - \1/'
    echo ""
    read -p "是否要覆盖现有配置? (y/N): " overwrite
    if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
        echo "❌ 用户取消操作"
        exit 0
    fi
fi

echo ""
echo "🔧 开始自动配置..."

# 生成动态配置
TEMPLATE_FILE="mcp-tools-config/augment-configs/settings-template.json"
TEMP_CONFIG="/tmp/augment-mcp-config.json"

# 替换模板中的动态路径
sed "s|/Users/uvu/YunYan|$CURRENT_DIR|g" "$TEMPLATE_FILE" > "$TEMP_CONFIG"

# 使用 jq 合并配置 (如果可用)
if command -v jq &> /dev/null; then
    echo "✅ 使用 jq 进行智能合并..."
    
    # 读取现有配置
    EXISTING_CONFIG=$(cat "$AUGMENT_SETTINGS")
    NEW_MCP_CONFIG=$(cat "$TEMP_CONFIG")
    
    # 合并配置
    echo "$EXISTING_CONFIG" | jq --argjson new "$NEW_MCP_CONFIG" '. + $new' > "$AUGMENT_SETTINGS.tmp"
    mv "$AUGMENT_SETTINGS.tmp" "$AUGMENT_SETTINGS"
    
    echo "✅ 配置已成功合并"
else
    echo "⚠️ jq 未安装，使用简单替换方法..."
    
    # 简单的配置替换
    if grep -q '"augment.advanced"' "$AUGMENT_SETTINGS"; then
        # 替换现有的 augment.advanced 部分
        python3 -c "
import json
import sys

# 读取现有配置
with open('$AUGMENT_SETTINGS', 'r') as f:
    existing = json.load(f)

# 读取新配置
with open('$TEMP_CONFIG', 'r') as f:
    new_config = json.load(f)

# 合并配置
existing.update(new_config)

# 写回文件
with open('$AUGMENT_SETTINGS', 'w') as f:
    json.dump(existing, f, indent=2)

print('✅ 配置已更新')
" 2>/dev/null || {
        echo "❌ Python3 不可用，回退到手动配置"
        echo ""
        echo "📋 请手动配置:"
        echo "1. 复制以下内容到 Augment 设置文件:"
        echo "   文件位置: $AUGMENT_SETTINGS"
        echo ""
        echo "2. 配置内容:"
        cat "$TEMP_CONFIG"
        exit 1
    }
    fi
fi

# 清理临时文件
rm -f "$TEMP_CONFIG"

echo ""
echo "🎉 Augment 自动配置完成！"
echo ""
echo "📋 下一步:"
echo "1. 重启 Augment 应用"
echo "2. 验证 MCP 服务器是否正常加载"
echo "3. (可选) 配置 Brave Search API Key"
echo ""
echo "🔍 验证配置:"
echo "运行: ./mcp-tools-config/shared/verify-tools.sh"
echo ""
echo "📚 如有问题，请查看:"
echo "- 详细指南: mcp-tools-config/augment-setup-guide.md"
echo "- 备份文件: $BACKUP_FILE"
