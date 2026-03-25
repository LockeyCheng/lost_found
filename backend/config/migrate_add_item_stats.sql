-- 迁移脚本：为items表添加统计字段
-- 执行顺序：先添加字段，然后更新现有数据

-- 1. 添加新字段到items表
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS reward_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS recommendation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- 2. 创建关联表
CREATE TABLE IF NOT EXISTS item_followers (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id, user_id)
);

CREATE TABLE IF NOT EXISTS item_recommendations (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id, user_id)
);

CREATE TABLE IF NOT EXISTS item_shares (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  share_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 为新增字段创建索引
CREATE INDEX IF NOT EXISTS idx_items_reward_amount ON items(reward_amount);
CREATE INDEX IF NOT EXISTS idx_items_view_count ON items(view_count);
CREATE INDEX IF NOT EXISTS idx_item_followers_item_id ON item_followers(item_id);
CREATE INDEX IF NOT EXISTS idx_item_followers_user_id ON item_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_item_recommendations_item_id ON item_recommendations(item_id);
CREATE INDEX IF NOT EXISTS idx_item_recommendations_user_id ON item_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_item_shares_item_id ON item_shares(item_id);
CREATE INDEX IF NOT EXISTS idx_item_shares_user_id ON item_shares(user_id);

-- 4. 更新现有数据（为测试数据添加示例值）
UPDATE items SET 
  reward_amount = CASE 
    WHEN id = 1 THEN 200.00
    WHEN id = 2 THEN 1000.00
    WHEN id = 3 THEN 50.00
    ELSE 0.00
  END,
  view_count = CASE 
    WHEN id = 1 THEN 156
    WHEN id = 2 THEN 289
    WHEN id = 3 THEN 89
    ELSE 0
  END,
  follower_count = CASE 
    WHEN id = 1 THEN 23
    WHEN id = 2 THEN 45
    WHEN id = 3 THEN 12
    ELSE 0
  END,
  recommendation_count = CASE 
    WHEN id = 1 THEN 12
    WHEN id = 2 THEN 28
    WHEN id = 3 THEN 5
    ELSE 0
  END,
  share_count = CASE 
    WHEN id = 1 THEN 8
    WHEN id = 2 THEN 15
    WHEN id = 3 THEN 3
    ELSE 0
  END
WHERE id IN (1, 2, 3);

-- 5. 验证迁移结果
SELECT 
  id,
  title,
  reward_amount,
  view_count,
  follower_count,
  recommendation_count,
  share_count
FROM items
ORDER BY id;