#!/bin/bash

echo "🚀 启动失物招领系统 - 完整版本"
echo "="*60

# 检查环境
echo "🔍 检查系统环境..."
node --version || { echo "❌ Node.js未安装"; exit 1; }
echo "✅ Node.js: $(node --version)"

# 创建必要目录
echo "📁 创建目录结构..."
mkdir -p backend/uploads
mkdir -p frontend/build

# 启动后端服务
echo ""
echo "🔄 启动后端服务..."
cd backend

# 检查端口是否被占用
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口5000被占用，尝试端口5001..."
    sed -i '' 's/PORT || 5000/PORT || 5001/g' enhanced-server.js 2>/dev/null || true
fi

# 启动增强版服务器
node enhanced-server.js &
BACKEND_PID=$!
sleep 3

# 检查后端是否启动
BACKEND_URL="http://localhost:5000"
if curl -s "$BACKEND_URL/health" > /dev/null; then
    echo "✅ 后端启动成功 (PID: $BACKEND_PID)"
    echo "   🌐 地址: $BACKEND_URL"
else
    # 尝试端口5001
    BACKEND_URL="http://localhost:5001"
    if curl -s "$BACKEND_URL/health" > /dev/null; then
        echo "✅ 后端启动成功 (PID: $BACKEND_PID)"
        echo "   🌐 地址: $BACKEND_URL"
    else
        echo "❌ 后端启动失败"
        exit 1
    fi
fi

# 创建前端界面
echo ""
echo "🔄 创建前端界面..."
cd ../frontend

# 创建现代化的前端页面
cat > build/index.html << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>失物招领系统 - 完整版</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --primary: #4361ee;
            --secondary: #3a0ca3;
            --success: #4cc9f0;
            --warning: #f72585;
            --light: #f8f9fa;
            --dark: #212529;
            --gray: #6c757d;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: var(--dark);
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            text-align: center;
            padding: 40px 20px;
            color: white;
        }
        
        .logo {
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        h1 {
            font-size: 42px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 18px;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto 30px;
        }
        
        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        
        .card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }
        
        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .card-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: white;
            font-size: 20px;
        }
        
        .card-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--dark);
        }
        
        .card-content {
            color: var(--gray);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .stat-item {
            text-align: center;
            padding: 15px;
            background: var(--light);
            border-radius: 10px;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 12px;
            color: var(--gray);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .api-section {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .api-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .api-endpoint {
            background: var(--light);
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid var(--primary);
        }
        
        .method {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            margin-right: 10px;
        }
        
        .method-get { background: #61affe; color: white; }
        .method-post { background: #49cc90; color: white; }
        .method-put { background: #fca130; color: white; }
        .method-delete { background: #f93e3e; color: white; }
        
        .endpoint-path {
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            color: var(--dark);
            margin: 5px 0;
        }
        
        .test-buttons {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: var(--primary);
            color: white;
        }
        
        .btn-primary:hover {
            background: var(--secondary);
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: var(--light);
            color: var(--dark);
            border: 1px solid #dee2e6;
        }
        
        .btn-secondary:hover {
            background: #e9ecef;
        }
        
        .items-list {
            margin-top: 20px;
        }
        
        .item-card {
            background: var(--light);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 15px;
            border-left: 4px solid var(--primary);
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .item-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--dark);
        }
        
        .item-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-lost { background: #ffeaa7; color: #d35400; }
        .status-found { background: #a3e4d7; color: #0d6251; }
        .status-returned { background: #d6eaf8; color: #21618c; }
        
        .item-meta {
            display: flex;
            gap: 15px;
            font-size: 14px;
            color: var(--gray);
            margin-top: 10px;
        }
        
        .item-meta i {
            margin-right: 5px;
        }
        
        footer {
            text-align: center;
            padding: 30px;
            color: white;
            opacity: 0.8;
            font-size: 14px;
        }
        
        .system-info {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
        }
        
        .code-block {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            margin: 15px 0;
            overflow-x: auto;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            h1 {
                font-size: 32px;
            }
            
            .dashboard {
                grid-template-columns: 1fr;
            }
            
            .api-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo">
                <i class="fas fa-search"></i>
            </div>
            <h1>失物招领系统</h1>
            <p class="subtitle">一个功能完整的失物招领平台，帮助人们找回遗失物品，提供线索，连接失主与拾主</p>
        </header>
        
        <div class="dashboard">
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">
                        <i class="fas fa-server"></i>
                    </div>
                    <div>
                        <div class="card-title">后端服务状态</div>
                        <div class="card-content">Node.js增强版服务器</div>
                    </div>
                </div>
                <div id="backend-status">检查中...</div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">
                        <i class="fas fa-database"></i>
                    </div>
                    <div>
                        <div class="card-title">数据统计</div>
                        <div class="card-content">实时系统数据</div>
                    </div>
                </div>
                <div id="stats-data">加载中...</div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <div>
                        <div class="card-title">测试账号</div>
                        <div class="card-content">立即体验系统功能</div>
                    </div>
                </div>
                <div class="card-content">
                    <p><strong>用户名:</strong> testuser</p>
                    <p><strong>密码:</strong> test123</p>
                    <div class="test-buttons">
                        <button class="btn btn-primary" onclick="testLogin()">
                            <i class="fas fa-sign-in-alt"></i> 测试登录
                        </button>
                        <button class="btn btn-secondary" onclick="testItems()">
                            <i class="fas fa-box"></i> 获取物品
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="api-section">
            <h2><i class="fas fa-plug"></i> API端点</h2>
            <p>完整的RESTful API接口，支持所有CRUD操作</p>
            
            <div class="api-grid">
                <div class="api-endpoint">
                    <span class="method method-get">GET</span>
                    <div class="endpoint-path">/health</div>
                    <p>健康检查端点</p>
                    <button class="btn btn-secondary" onclick="testEndpoint('/health')">测试</button>
                </div>
                
                <div class="api-endpoint">
                    <span class="method method-post">POST</span>
                    <div class="endpoint-path">/api/auth/login</div>
                    <p>用户登录</p>
                    <button class="btn btn-secondary" onclick="testLogin()">测试</button>
                </div>
                
                <div class="api-endpoint">
                    <span class="method method-get">GET</span>
                    <div class="endpoint-path">/api/items</div>
                    <p>获取物品列表</p>
                    <button class="btn btn-secondary" onclick="testItems()">测试</button>
                </div>
                
                <div class="api-endpoint">
                    <span class="method method-post">POST</span>
                    <div class="endpoint-path">/api/items</div>
                    <p>创建新物品</p>
                    <button class="btn btn-secondary" onclick="testCreateItem()">测试</button>
                </div>
                
                <div class="api-endpoint">
                    <span class="method method-get">GET</span>
                    <div class="endpoint-path">/api/stats</div>
                    <p>系统统计</p>
                    <button class="btn btn-secondary" onclick="testStats()">测试</button>
                </div>
                
                <div class="api-endpoint">
                    <span class="method method-get">GET</span>
                    <div class="endpoint-path">/api/categories</div>
                    <p>获取分类</p>
                    <button class="btn btn-secondary" onclick="testCategories()">测试</button>
                </div>
            </div>
        </div>
        
        <div class="api-section">
            <h2><i class="fas fa-box-open"></i> 最新物品</h2>
            <p>系统中最近发布的遗失物品</p>
            <div id="items-list">加载中...</div>
        </div>
        
        <div class="system-info">
            <h3><i class="fas fa-info-circle"></i> 系统信息</h3>
            <p><strong>项目位置:</strong> <code>/Users/lockey/.openclaw/workspace/lost-and-found-system/</code></p>
            <p><strong>后端地址:</strong> <code id="backend-url">http://localhost:5000</code></p>
            <p><strong>前端地址:</strong> <code>http://localhost:3000</code></p>
            
            <h4 style="margin-top: 20px;">功能特性:</h4>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li>完整的用户认证系统 (JWT)</li>
                <li>物品CRUD操作</li>
                <li>线索管理系统</li>
                <li>文件上传支持</li>
                <li>数据统计和分析</li>
                <li>分类管理</li>
                <li>分页和筛选功能</li>
                <li>响应式设计</li>
            </ul>
            
            <h4 style="margin-top: 20px;">项目结构:</h4>
            <div class="code-block">
lost-and-found-system/
├── backend/
│   ├── enhanced-server.js    # 增强版服务器
│   ├── server.js            # 完整Express服务器
│   ├── routes/              # API路由
│   ├── config/              # 配置
│   └── uploads/             # 上传文件
├── frontend/
│   ├── src/                 # React源代码
│   │   ├── pages/          # 页面组件
│   │   ├── contexts/       # 上下文
│   │   └── services/       # API服务
│   └── build/              # 构建文件
├── start-complete.sh       # 完整启动脚本
└── README.md               # 项目文档
            </div>
        </div>
    </div>
    
    <footer>
        <p>失物招领系统 © 2024 | 使用Node.js内置模块构建 | 功能完整版本</p>
        <p>后端PID: <span id="backend-pid">$BACKEND_PID</span> | 前端PID: <span id="frontend-pid">$FRONTEND_PID</span></p>
    </footer>
    
    <script>
        const BACKEND_URL = '$BACKEND_URL';
        document.getElementById('backend-url').textContent = BACKEND_URL;
        
        // 检查后端状态
        async function checkBackendStatus() {
            try {
                const response = await fetch(BACKEND_URL + '/health');
                const data = await response.json();
                
                document.getElementById('backend-status').innerHTML = \`
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">\${data.data_count.users}</div>
                            <div class="stat-label">用户</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">\${data.data_count.items}</div>
                            <div class="stat-label">物品</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">\${data.data_count.clues}</div>
                            <div class="stat-label">线索</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">✅</div>
                            <div class="stat-label">状态</div>
                        </div>
                    </div>
                \`;
            } catch (error) {
                document.getElementById('backend-status').innerHTML = \`
                    <div style="color: #dc3545; padding: 10px; background: #f8d7da; border-radius: 8px;">
                        <i class="fas fa-exclamation-triangle"></i> 后端连接失败
                    </div>
                \`;
            }
        }
        
        // 获取统计数据
        async function loadStats() {
            try {
                const response = await fetch(BACKEND_URL + '/api/stats');
                const data = await response.json();
                
                if (data.success) {
                    const stats = data.data.totals;
                    document.getElementById('stats-data').innerHTML = \`
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-value">\${stats.items}</div>
                                <div class="stat-label">总物品</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">\${stats.lost}</div>
                                <div class="stat-label">遗失中</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">\${stats.found}</div>
                                <div class="stat-label">已找到</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">\${stats.clues}</div>
                                <div class="stat-label">线索数</div>
                            </div>
                        </div>
                    \`;
                }
            } catch (error) {
                document.getElementById('stats-data').innerHTML = \`
                    <div style="color: #6c757d;">无法加载统计数据</div>
                \`;
            }
        }
        
        // 加载物品列表
        async function loadItems() {
            try {
                const response = await fetch(BACKEND_URL + '/api/items?limit=5');
                const data = await response.json();
                
                if (data.success) {
                    let itemsHtml = '';
                    data.data.items.forEach(item => {
                        const statusClass = \`status-\${item.status}\`;
                        const statusText = item.status === 'lost' ? '遗失中' : 
                                          item.status === 'found' ? '已找到' : '已归还';
                        
                        itemsHtml += \`
                            <div class="item-card">
                                <div class="item-header">
                                    <div class="item-title">\${item.title}</div>
                                    <div class="item-status \${statusClass}">\${statusText}</div>
                                </div>
                                <p>\${item.description}</p>
                                <div class="item-meta">
                                    <span><i class="fas fa-map-marker-alt"></i> \${item.lost_location}</span>
                                    <span><i class="fas fa-calendar"></i> \${item.lost_date}</span>
                                    <span><i class="fas fa-tag"></i> \${item.category}</span>
                                </div>
                            </div>
                        \`;
                    });
                    
                    document.getElementById('items-list').innerHTML = itemsHtml;
                }
            } catch (error) {
                document.getElementById('items-list').innerHTML = \`
                    <div style="color: #6c757d;">无法加载物品列表</div>
                \`;
            }
        }
        
        // API测试函数
        async function testEndpoint(endpoint) {
            try {
                const response = await fetch(BACKEND_URL + endpoint);
                const data = await response.json();
                alert(\`\${endpoint} 响应:\\n\\n\${JSON.stringify(data, null, 2)}\`);
            } catch (error) {
                alert(\`\${endpoint} 请求失败: \${error.message}\`);
            }
        }
        
        async function testLogin() {
            try {
                const response = await fetch(BACKEND_URL + '/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: 'testuser',
                        password: 'test123'
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert(\`登录成功！\\n用户: \${data.data.user.username}\\n令牌: \${data.data.token.substring(0, 30)}...\`);
                } else {
                    alert(\`登录失败: \${data.error}\`);
                }
            } catch (error) {
                alert(\`登录请求失败: \${error.message}\`);
            }
        }
        
        async function testItems() {
            try {
                const response = await fetch(BACKEND_URL + '/api/items');
                const data = await response.json();
                
                if (data.success) {
                    alert(\`获取物品成功！\\n共 \${data.data.pagination.total} 个物品\`);
                    loadItems(); // 刷新列表
                }
            } catch (error) {
                alert(\`获取物品失败: \${error.message}\`);
            }
        }
        
        async function testCreateItem() {
            try {
                // 先登录获取token
                const loginResponse = await fetch(BACKEND_URL + '/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: 'testuser',
                        password: 'test123'
                    })
                });
                
                const loginData = await loginResponse.json();
                
                if (!loginData.success) {
                    alert('请先登录');
                    return;
                }
                
                const token = loginData.data.token;
                
                // 创建新物品
                const itemResponse = await fetch(BACKEND_URL + '/api/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': \`Bearer \${token}\`
                    },
                    body: JSON.stringify({
                        title: '测试物品 ' + new Date().toLocaleTimeString(),
                        description: '这是一个测试物品，用于演示创建功能',
                        category: '其他',
                        lost_date: new Date().toISOString().split('T')[0],
                        lost_location: '测试地点',
                        status: 'lost'
                    })
                });
                
                const itemData = await itemResponse.json();
                
                if (itemData.success) {
                    alert(\`物品创建成功！\\nID: \${itemData.data.item.id}\\n标题: \${itemData.data.item.title}\`);
                    loadItems(); // 刷新列表
                    loadStats(); // 刷新统计
                } else {
                    alert(\`物品创建失败: \${itemData.error}\`);
                }
            } catch (error) {
                alert(\`创建物品失败: \${error.message}\`);
            }
        }
        
        async function testStats() {
            try {
                const response = await fetch(BACKEND_URL + '/api/stats');
                const data = await response.json();
                
                if (data.success) {
                    const stats = data.data.totals;
                    alert(\`系统统计:\\n\\n物品总数: \${stats.items}\\n遗失中: \${stats.lost}\\n已找到: \${stats.found}\\n线索数: \${stats.clues}\\n用户数: \${stats.users}\`);
                }
            } catch (error) {
                alert(\`获取统计失败: \${error.message}\`);
            }
        }
        
        async function testCategories() {
            try {
                const response = await fetch(BACKEND_URL + '/api/categories');
                const data = await response.json();
                
                if (data.success) {
                    alert(\`可用分类:\\n\\n\${data.data.categories.join(', ')}\`);
                }
            } catch (error) {
                alert(\`获取分类失败: \${error.message}\`);
            }
        }
        
        // 页面加载时初始化
        document.addEventListener('DOMContentLoaded', function() {
            checkBackendStatus();
            loadStats();
            loadItems();
            
            // 每30秒刷新一次数据
            setInterval(() => {
                checkBackendStatus();
                loadStats();
            }, 30000);
        });
    </script>
</body>
</html>
EOF

echo "✅ 前端界面创建完成"

# 启动前端静态服务器
echo "🌐 启动前端服务器..."
npx serve -s build -l 3000 2>/dev/null &
FRONTEND_PID=$!
sleep 3

echo ""
echo "="*60
echo "🎉 失物招领系统 - 完整版本启动成功！"
echo "="*60
echo ""
echo "🌐 前端界面: http://localhost:3000"
echo "🔧 后端API: $BACKEND_URL"
echo "📊 健康检查: $BACKEND_URL/health"
echo "📖 API文档: $BACKEND_URL/api"
echo ""
echo "📝 测试账号:"
echo "   用户名: testuser"
echo "   密码: test123"
echo ""
echo "📁 项目位置:"
echo "   /Users/lockey/.openclaw/workspace/lost-and-found-system/"
echo ""
echo "🔍 完整功能包括:"
echo "   ✅ 用户认证系统 (注册/登录/JWT)"
echo "   ✅ 物品CRUD操作 (创建/读取/更新/删除)"
echo "   ✅ 线索管理系统"
echo "   ✅ 文件上传支持"
echo "   ✅ 数据统计和分析"
echo "   ✅ 分类管理"
echo "   ✅ 分页和筛选功能"
echo "   ✅ 响应式前端界面"
echo ""
echo "⚡ 技术栈:"
echo "   • 后端: Node.js内置模块 (无外部依赖)"
echo "   • 前端: HTML5 + CSS3 + JavaScript"
echo "   • 数据: JSON文件存储"
echo "   • 认证: JWT令牌"
echo ""
echo "📊 运行进程:"
echo "   后端: PID $BACKEND_PID"
echo "   前端: PID $FRONTEND_PID"
echo ""
echo "🛑 停止系统: 按 Ctrl+C"
echo "="*60

# 等待用户中断
trap "echo ''; echo '🛑 正在停止系统...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ 系统已停止'; exit 0" INT
wait