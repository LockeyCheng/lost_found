-- 测试新字段的SQL脚本
-- 运行方式：psql -h localhost -U lockey -d lost_found -f test_new_fields.sql

-- 1. 查看items表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'items' 
ORDER BY ordinal_position;

-- 2. 查看新添加的字段
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'items' 
AND column_name IN ('reward_amount', 'view_count', 'follower_count', 'recommendation_count', 'share_count')
ORDER BY ordinal_position;

-- 3. 查看测试数据中的新字段值
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

-- 4. 查看新创建的表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'item_%'
ORDER BY table_name;

-- 5. 检查索引
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename LIKE 'item_%'
ORDER BY tablename, indexname;

-- 6. 测试插入新物品（包含新字段）
INSERT INTO items (
  user_id, 
  title, 
  description, 
  category, 
  lost_date, 
  lost_location, 
  status,
  reward_amount,
  view_count,
  follower_count,
  recommendation_count,
  share_count
) VALUES (
  1,
  '测试物品 - 新字段',
  '这是一个测试物品，用于验证新字段功能',
  '测试',
  '2024-03-25',
  '测试地点',
  'lost',
  150.50,
  0,
  0,
  0,
  0
) RETURNING *;

-- 7. 验证插入结果
SELECT 
  id,
  title,
  reward_amount,
  view_count,
  follower_count,
  recommendation_count,
  share_count,
  created_at
FROM items 
WHERE title LIKE '测试物品%'
ORDER BY created_at DESC;

-- 8. 测试更新浏览量
UPDATE items 
SET view_count = view_count + 1 
WHERE id = (SELECT id FROM items WHERE title LIKE '测试物品%' ORDER BY created_at DESC LIMIT 1)
RETURNING id, title, view_count;

-- 9. 清理测试数据（可选）
-- DELETE FROM items WHERE title LIKE '测试物品%';