#!/bin/bash

# Shrimp Task Manager 管理脚本
# 用法: ./scripts/shrimp-manager.sh [start|stop|status|gui|clean]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_DIR/.shrimp-task-manager/data"
PID_FILE="$DATA_DIR/shrimp.pid"

# 确保数据目录存在
mkdir -p "$DATA_DIR"

# 设置环境变量
export DATA_DIR="$DATA_DIR"
export TEMPLATES_USE="zh"
export ENABLE_GUI="true"
export LOG_LEVEL="info"

case "$1" in
    start)
        echo "启动 Shrimp Task Manager..."
        if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
            echo "Shrimp Task Manager 已经在运行中 (PID: $(cat "$PID_FILE"))"
            exit 1
        fi
        
        nohup npx -y mcp-shrimp-task-manager > "$DATA_DIR/shrimp.log" 2>&1 &
        echo $! > "$PID_FILE"
        echo "Shrimp Task Manager 已启动 (PID: $!)"
        echo "日志文件: $DATA_DIR/shrimp.log"
        ;;
        
    stop)
        echo "停止 Shrimp Task Manager..."
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if kill -0 "$PID" 2>/dev/null; then
                kill "$PID"
                rm -f "$PID_FILE"
                echo "Shrimp Task Manager 已停止"
            else
                echo "进程不存在，清理 PID 文件"
                rm -f "$PID_FILE"
            fi
        else
            echo "Shrimp Task Manager 未运行"
        fi
        ;;
        
    status)
        if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
            echo "Shrimp Task Manager 正在运行 (PID: $(cat "$PID_FILE"))"
        else
            echo "Shrimp Task Manager 未运行"
        fi
        ;;
        
    gui)
        echo "启动 Shrimp Web GUI..."
        export GUI_PORT=3000
        npx -y mcp-shrimp-task-manager --gui
        ;;
        
    clean)
        echo "清理 Shrimp 数据..."
        read -p "确定要删除所有任务数据吗？(y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$DATA_DIR"/*
            echo "数据已清理"
        else
            echo "操作已取消"
        fi
        ;;
        
    logs)
        echo "显示 Shrimp 日志..."
        if [ -f "$DATA_DIR/shrimp.log" ]; then
            tail -f "$DATA_DIR/shrimp.log"
        else
            echo "日志文件不存在"
        fi
        ;;
        
    *)
        echo "用法: $0 {start|stop|status|gui|clean|logs}"
        echo ""
        echo "命令说明:"
        echo "  start  - 启动 Shrimp Task Manager 服务"
        echo "  stop   - 停止 Shrimp Task Manager 服务"
        echo "  status - 检查服务状态"
        echo "  gui    - 启动 Web GUI 界面"
        echo "  clean  - 清理所有数据"
        echo "  logs   - 查看实时日志"
        exit 1
        ;;
esac
