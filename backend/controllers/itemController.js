const pool = require('../config/db');

// 获取所有物品
const getAllItems = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    
    let query = `
      SELECT 
        i.*,
        u.username as owner_name,
        u.full_name as owner_full_name,
        u.phone as owner_phone,
        (SELECT image_url FROM item_images WHERE item_id = i.id AND is_primary = true LIMIT 1) as primary_image,
        COUNT(c.id) as clue_count
      FROM items i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN clues c ON i.id = c.item_id
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      conditions.push(`i.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (category) {
      conditions.push(`i.category = $${paramCount}`);
      params.push(category);
      paramCount++;
    }

    if (search) {
      conditions.push(`(i.title ILIKE $${paramCount} OR i.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY i.id, u.username, u.full_name, u.phone ORDER BY i.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      items: result.rows
    });
  } catch (error) {
    console.error('获取物品列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取单个物品详情
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // 获取物品基本信息
    const itemResult = await pool.query(
      `SELECT 
        i.*,
        u.username as owner_name,
        u.full_name as owner_full_name,
        u.email as owner_email,
        u.phone as owner_phone
       FROM items i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.id = $1`,
      [id]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '物品不存在'
      });
    }

    const item = itemResult.rows[0];

    // 获取物品图片
    const imagesResult = await pool.query(
      'SELECT * FROM item_images WHERE item_id = $1 ORDER BY is_primary DESC, created_at',
      [id]
    );

    // 获取线索
    const cluesResult = await pool.query(
      `SELECT 
        c.*,
        u.username as reporter_name,
        u.full_name as reporter_full_name
       FROM clues c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.item_id = $1
       ORDER BY c.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      item: {
        ...item,
        images: imagesResult.rows,
        clues: cluesResult.rows
      }
    });
  } catch (error) {
    console.error('获取物品详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 创建新物品
const createItem = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      lost_date, 
      lost_location,
      reward_amount = 0.00  // 新增：悬赏金额，默认为0
    } = req.body;
    const userId = req.user.id;

    // 验证必填字段
    if (!title || !lost_date) {
      return res.status(400).json({
        success: false,
        message: '标题和遗失日期为必填项'
      });
    }

    // 验证悬赏金额（必须为非负数）
    if (reward_amount < 0) {
      return res.status(400).json({
        success: false,
        message: '悬赏金额不能为负数'
      });
    }

    // 创建物品（包含新字段）
    const newItem = await pool.query(
      `INSERT INTO items (user_id, title, description, category, lost_date, lost_location, status, reward_amount) 
       VALUES ($1, $2, $3, $4, $5, $6, 'lost', $7) 
       RETURNING *`,
      [userId, title, description, category, lost_date, lost_location, reward_amount]
    );

    // 处理上传的图片
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file, index) => {
        return pool.query(
          'INSERT INTO item_images (item_id, image_url, is_primary) VALUES ($1, $2, $3)',
          [newItem.rows[0].id, `/uploads/${file.filename}`, index === 0] // 第一张图片设为主图
        );
      });

      await Promise.all(imagePromises);
    }

    res.status(201).json({
      success: true,
      message: '物品登记成功',
      item: newItem.rows[0]
    });
  } catch (error) {
    console.error('创建物品错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新物品状态
const updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // 验证状态值
    const validStatuses = ['lost', 'found', 'returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }

    // 检查物品是否存在且属于当前用户
    const itemCheck = await pool.query(
      'SELECT * FROM items WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '物品不存在或无权操作'
      });
    }

    // 更新状态
    const updatedItem = await pool.query(
      'UPDATE items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json({
      success: true,
      message: '物品状态更新成功',
      item: updatedItem.rows[0]
    });
  } catch (error) {
    console.error('更新物品状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 删除物品
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查物品是否存在且属于当前用户
    const itemCheck = await pool.query(
      'SELECT * FROM items WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '物品不存在或无权操作'
      });
    }

    // 删除物品（级联删除相关图片和线索）
    await pool.query('DELETE FROM items WHERE id = $1', [id]);

    res.json({
      success: true,
      message: '物品删除成功'
    });
  } catch (error) {
    console.error('删除物品错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 增加物品浏览量
const incrementViewCount = async (req, res) => {
  try {
    const { id } = req.params;

    // 使用原子操作增加浏览量
    const result = await pool.query(
      'UPDATE items SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING view_count',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '物品不存在'
      });
    }

    res.json({
      success: true,
      message: '浏览量增加成功',
      view_count: result.rows[0].view_count
    });
  } catch (error) {
    console.error('增加浏览量错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 关注/取消关注物品
const toggleFollowItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查物品是否存在
    const itemCheck = await pool.query('SELECT id FROM items WHERE id = $1', [id]);
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '物品不存在'
      });
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
      success: true,
      message,
      action,
      follower_count: updatedItem.rows[0].follower_count
    });
  } catch (error) {
    console.error('关注操作错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 推荐物品
const recommendItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查物品是否存在
    const itemCheck = await pool.query('SELECT id FROM items WHERE id = $1', [id]);
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '物品不存在'
      });
    }

    // 检查是否已推荐
    const existingRecommendation = await pool.query(
      'SELECT id FROM item_recommendations WHERE item_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingRecommendation.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: '您已经推荐过此物品'
      });
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
      success: true,
      message: '推荐成功',
      recommendation_count: updatedItem.rows[0].recommendation_count
    });
  } catch (error) {
    console.error('推荐物品错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 记录转发
const recordShare = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { share_type = 'copy_link' } = req.body; // 转发类型：wechat, weibo, copy_link等

    // 检查物品是否存在
    const itemCheck = await pool.query('SELECT id FROM items WHERE id = $1', [id]);
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '物品不存在'
      });
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
      success: true,
      message: '转发记录成功',
      share_type,
      share_count: updatedItem.rows[0].share_count
    });
  } catch (error) {
    console.error('记录转发错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItemStatus,
  deleteItem,
  incrementViewCount,
  toggleFollowItem,
  recommendItem,
  recordShare
};