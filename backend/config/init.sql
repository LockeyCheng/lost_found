-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建物品表
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  lost_date DATE NOT NULL,
  lost_location VARCHAR(500),
  status VARCHAR(20) DEFAULT 'lost', -- lost, found, returned
  reward_amount DECIMAL(10, 2) DEFAULT 0.00, -- 悬赏金额
  view_count INTEGER DEFAULT 0, -- 浏览量
  follower_count INTEGER DEFAULT 0, -- 关注数
  recommendation_count INTEGER DEFAULT 0, -- 推荐数
  share_count INTEGER DEFAULT 0, -- 转发数
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建线索表
CREATE TABLE IF NOT EXISTS clues (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  location VARCHAR(500),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建物品图片表
CREATE TABLE IF NOT EXISTS item_images (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建物品关注表
CREATE TABLE IF NOT EXISTS item_followers (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id, user_id) -- 确保用户不能重复关注同一物品
);

-- 创建物品推荐表
CREATE TABLE IF NOT EXISTS item_recommendations (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id, user_id) -- 确保用户不能重复推荐同一物品
);

-- 创建物品转发表
CREATE TABLE IF NOT EXISTS item_shares (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  share_type VARCHAR(50), -- 转发类型：wechat, weibo, copy_link等
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_clues_item_id ON clues(item_id);
CREATE INDEX idx_items_lost_date ON items(lost_date);
CREATE INDEX idx_items_reward_amount ON items(reward_amount);
CREATE INDEX idx_items_view_count ON items(view_count);
CREATE INDEX idx_item_followers_item_id ON item_followers(item_id);
CREATE INDEX idx_item_followers_user_id ON item_followers(user_id);
CREATE INDEX idx_item_recommendations_item_id ON item_recommendations(item_id);
CREATE INDEX idx_item_recommendations_user_id ON item_recommendations(user_id);
CREATE INDEX idx_item_shares_item_id ON item_shares(item_id);
CREATE INDEX idx_item_shares_user_id ON item_shares(user_id);

-- 插入测试用户 (密码: test123)
INSERT INTO users (username, email, password_hash, full_name, phone) 
VALUES 
('testuser', 'test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq5Q1B1pB6Z/6H8J3YVzJQ9q3YbWZa', '测试用户', '13800138000')
ON CONFLICT (username) DO NOTHING;

-- 插入测试物品
INSERT INTO items (user_id, title, description, category, lost_date, lost_location, status, reward_amount, view_count, follower_count, recommendation_count, share_count) 
VALUES 
(1, '黑色钱包', '内含身份证、银行卡若干', '钱包', '2024-03-15', '图书馆三楼自习区', 'lost', 200.00, 156, 23, 12, 8),
(1, '苹果手机', 'iPhone 14 Pro 深空黑色', '电子产品', '2024-03-18', '食堂二楼', 'found', 1000.00, 289, 45, 28, 15),
(1, '学生证', '张三，计算机学院', '证件', '2024-03-20', '教学楼A座', 'lost', 50.00, 89, 12, 5, 3)
ON CONFLICT DO NOTHING;

-- 插入测试线索
INSERT INTO clues (item_id, user_id, description, location, image_url) 
VALUES 
(1, 1, '在图书馆失物招领处看到类似钱包', '图书馆一楼服务台', '/uploads/clue1.jpg'),
(2, 1, '食堂工作人员捡到', '食堂二楼清洁处', '/uploads/clue2.jpg')
ON CONFLICT DO NOTHING;