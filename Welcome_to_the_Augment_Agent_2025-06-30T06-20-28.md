[ ] NAME: 文件系统Agent DESCRIPTION: 实现思源式文档管理系统
-[ ] NAME: 设计数据模型 DESCRIPTION: 定义Block/Document/Workspace结构 | 复杂度:H | 优先级:5 | 依赖:集成状态管理
-[ ] NAME: 文件树组件开发 DESCRIPTION: 实现可拖拽树形目录 | 复杂度:M | 优先级:5 | 依赖:设计数据模型
-[ ] NAME: 双向链接引擎 DESCRIPTION: 开发文档引用关系图算法 | 复杂度:H | 优先级:5 | 依赖:设计数据模型
-[ ] NAME: Markdown编辑器集成 DESCRIPTION: 集成ProseMirror + 定制 | 复杂度:M | 优先级:4 | 依赖:设计数据模型
-[ ] NAME: 本地存储模块 DESCRIPTION: 实现Tauri文件读写接口 | 复杂度:H | 优先级:5 | 依赖:设计数据模型