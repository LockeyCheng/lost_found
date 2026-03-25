const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB限制
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 获取所有物品（支持分页和筛选）
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      search,
      sortBy = 'created_at',
      order = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        i.*,
        u.username as owner_username,
        u.full_name as owner_name,
        COUNT(c.id) as clue_count,
        ARRAY_AGG(DISTINCT ii.image_url) as images
      FROM items i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN clues c ON i.id = c.item_id
      LEFT JOIN item_images ii ON i.id = ii.item_id
    `;
    
    const whereConditions = [];
    const queryParams = [];
    
    if (status) {
      whereConditions.push(`i.status = $${queryParams.length + 1}`);
      queryParams.push(status);
    }
    
    if (category) {
      whereConditions.push(`i.category = $${queryParams.length + 1}`);
      queryParams.push(category);
    }
    
    if (search) {
      whereConditions.push(`(i.title ILIKE $${queryParams.length + 1} OR i.description ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${search}%`);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += `
      GROUP BY i.id, u.username, u.full_name
      ORDER BY i.${sortBy} ${order}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) FROM items i';
    if (whereConditions.length > 0) {
      countQuery += ' WHERE ' + whereConditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      items: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取物品列表错误:', error);
    res.status(500).json({ error: '获取物品列表失败' });
  }
});

// 获取单个物品详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        i.*,
        u.username as owner_username,
        u.full_name as owner_name,
        u.phone as owner_phone,
        u.email as owner_email,
        ARRAY_AGG(DISTINCT ii.image_url) as images
       FROM items i
       LEFT JOIN users u ON i.user_id = u.id
       LEFT JOIN item_images ii ON i.id = ii.item_id
       WHERE i.id = $1
       GROUP BY i.id, u.username, u.full_name, u.phone, u.email`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '物品未找到' });
    }
    
    // 获取相关线索
    const cluesResult = await pool.query(
      `SELECT c.*, u.username, u.full_name 
       FROM clues c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.item_id = $1
       ORDER BY c.created_at DESC`,
      [id]
    );
    
    const item = result.rows[0];
    item.clues = cluesResult.rows;
    
    res.json({ item });
  } catch (error) {
    console.error('获取物品详情错误:', error);
    res.status(500).json({ error: '获取物品详情失败' });
  }
});

// 创建新物品
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      lost_date, 
      lost_location,
      status = 'lost',
      reward_amount = 0.00
    } = req.body;
    
    // 这里应该从JWT获取用户ID，暂时使用测试用户
    const userId = 1;
    
    if (!title || !lost_date) {
      return res.status(400).json({ error: '标题和遗失日期为必填项' });
    }
    
    // 验证悬赏金额
    if (reward_amount < 0) {
      return res.status(400).json({ error: '悬赏金额不能为负数' });
    }

    // 创建物品
    const itemResult = await pool.query(
      `INSERT INTO items (user_id, title, description, category, lost_date, lost_location, status, reward_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, title, description, category, lost_date, lost_location, status, reward_amount]
    );
    
    const item = itemResult.rows[0];
    
    // 保存图片
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file, index) => {
        return pool.query(
          'INSERT INTO item_images (item_id, image_url, is_primary) VALUES ($1, $2, $3)',
          [item.id, `/uploads/${file.filename}`, index === 0]
        );
      });
      
      await Promise.all(imagePromises);
    }
    
    res.status(201).json({
      message: '物品创建成功',
      item
    });
  } catch (error) {
    console.error('创建物品错误:', error);
    res.status(500).json({ error: '创建物品失败' });
  }
});

// 更新物品状态
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['lost', 'found', 'returned'].includes(status)) {
      return res.status(400).json({ error: '状态值无效' });
    }
    
    const result = await pool.query(
      'UPDATE items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '物品未找到' });
    }
    
    res.json({
      message: '物品状态更新成功',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('更新物品状态错误:', error);
    res.status(500).json({ error: '更新物品状态失败' });
  }
});

// 删除物品
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '物品未找到' });
    }
    
    res.json({ message: '物品删除成功' });
  } catch (error) {
    console.error('删除物品错误:', error);
    res.status(500).json({ error: '删除物品失败' });
  }
});

// 增加物品浏览量（无需认证）
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;

    // 使用原子操作增加浏览量
    const result = await pool.query(
      'UPDATE items SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING view_count',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '物品不存在' });
    }

    res.json({
      message: '浏览量增加成功',
      view_count: result.rows[0].view_count
    });
  } catch (error) {
    console.error('增加浏览量错误:', error);
    res.status(500).json({ error: '增加浏览量失败' });
  }
});

// 关注/取消关注物品（需要认证）
router.post('/:id/follow', async (req, res) => {
  try {
    const { id } = req.params;
    // 这里应该从JWT获取用户ID，暂时使用测试用户
    const userId = 1;

    // 检查物品是否存在
    const itemCheck = await pool.query('SELECT id FROM items WHERE id = $1', [id]);
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: '物品不存在' });
    }

    // 检查是否已关注
    const existingFollow = await pool.query(
      'SELECT id FROM item_followers WHERE item_id = $1 AND user_id = $2',
      [id, userId]
    );

    let message;
    let action;

    if (existingFollow.rows.length > 0) {
      // 取消关注
      await pool.query(
        'DELETE FROM item_followers WHERE item_id = $1 AND user_id = $2',
        [id, userId]
      );
      // 减少关注数
      await pool.query(
        'UPDATE items SET follower_count = follower_count - 1 WHERE id = $1',
        [id]
      );
      message = '取消关注成功';
      action = 'unfollow';
    } else {
      // 添加关注
      await pool.query(
        'INSERT INTO item_followers (item_id, user_id) VALUES ($1, $2)',
        [id, userId]
      );
      // 增加关注数
      await pool.query(
        'UPDATE items SET follower_count = follower_count + 1 WHERE id = $1',
        [id]
      );
      message = '关注成功';
      action = 'follow';
    }

    // 获取更新后的关注数
    const updatedItem = await pool.query(
      'SELECT follower_count FROM items WHERE id = $1',
      [id]
    );

    res.json({
      message,
      action,
      follower_count: updatedItem.rows[0].follower_count
    });
  } catch (error) {
    console.error('关注操作错误:', error);
    res.status(500).json({ error: '关注操作失败' });
  }
});

// 推荐物品（需要认证）
router.post('/:id/recommend', async (req, res) => {
  try {
    const { id } = req.params;
    // 这里应该从JWT获取用户ID，暂时使用测试用户
    const userId = 1;

    // 检查物品是否存在
    const itemCheck = await pool.query('SELECT id FROM items WHERE id = $1', [id]);
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: '物品不存在' });
    }

    // 检查是否已推荐
    const existingRecommendation = await pool.query(
      'SELECT id FROM item_recommendations WHERE item_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingRecommendation.rows.length > 0) {
      return res.status(400).json({ error: '您已经推荐过此物品' });
    }

    // 添加推荐记录
    await pool.query(
      'INSERT INTO item_recommendations (item_id, user_id) VALUES ($1, $2)',
      [id, userId]
    );

    // 增加推荐数
    await pool.query(
      'UPDATE items SET recommendation_count = recommendation_count + 1 WHERE id = $1',
      [id]
    );

    // 获取更新后的推荐数
    const updatedItem = await pool.query(
      'SELECT recommendation_count FROM items WHERE id = $1',
      [id]
    );

    res.json({
      message: '推荐成功',
      recommendation_count: updatedItem.rows[0].recommendation_count
    });
  } catch (error) {
    console.error('推荐物品错误:', error);
    res.status(500).json({ error: '推荐失败' });
  }
});

// 记录转发（需要认证）
router.post('/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    const { share_type = 'copy_link' } = req.body; // 转发类型：wechat, weibo, copy_link等
    // 这里应该从JWT获取用户ID，暂时使用测试用户
    const userId = 1;

    // 检查物品是否存在
    const itemCheck = await pool.query('SELECT id FROM items WHERE id = $1', [id]);
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: '物品不存在' });
    }

    // 记录转发
    await pool.query(
      'INSERT INTO item_shares (item_id, user_id, share_type) VALUES ($1, $2, $3)',
      [id, userId, share_type]
    );

    // 增加转发数
    await pool.query(
      'UPDATE items SET share_count = share_count + 1 WHERE id = $1',
      [id]
    );

    // 获取更新后的转发数
    const updatedItem = await pool.query(
      'SELECT share_count FROM items WHERE id = $1',
      [id]
    );

    res.json({
      message: '转发记录成功',
      share_type,
      share_count: updatedItem.rows[0].share_count
    });
  } catch (error) {
    console.error('记录转发错误:', error);
    res.status(500).json({ error: '记录转发失败' });
  }
});

module.exports = router;