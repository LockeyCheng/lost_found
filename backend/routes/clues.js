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
    cb(null, 'clue-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

// 获取物品的所有线索
router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const result = await pool.query(
      `SELECT c.*, u.username, u.full_name 
       FROM clues c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.item_id = $1
       ORDER BY c.created_at DESC`,
      [itemId]
    );
    
    res.json({ clues: result.rows });
  } catch (error) {
    console.error('获取线索错误:', error);
    res.status(500).json({ error: '获取线索失败' });
  }
});

// 创建新线索
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { item_id, description, location } = req.body;
    
    // 这里应该从JWT获取用户ID，暂时使用测试用户
    const userId = 1;
    
    if (!item_id || !description) {
      return res.status(400).json({ error: '物品ID和描述为必填项' });
    }
    
    // 验证物品是否存在
    const itemCheck = await pool.query('SELECT id FROM items WHERE id = $1', [item_id]);
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: '物品未找到' });
    }
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const result = await pool.query(
      `INSERT INTO clues (item_id, user_id, description, location, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [item_id, userId, description, location, imageUrl]
    );
    
    res.status(201).json({
      message: '线索添加成功',
      clue: result.rows[0]
    });
  } catch (error) {
    console.error('创建线索错误:', error);
    res.status(500).json({ error: '创建线索失败' });
  }
});

// 更新线索
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { description, location } = req.body;
    
    // 检查线索是否存在
    const clueCheck = await pool.query('SELECT * FROM clues WHERE id = $1', [id]);
    if (clueCheck.rows.length === 0) {
      return res.status(404).json({ error: '线索未找到' });
    }
    
    let imageUrl = clueCheck.rows[0].image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const result = await pool.query(
      `UPDATE clues 
       SET description = $1, location = $2, image_url = $3
       WHERE id = $4 RETURNING *`,
      [description, location, imageUrl, id]
    );
    
    res.json({
      message: '线索更新成功',
      clue: result.rows[0]
    });
  } catch (error) {
    console.error('更新线索错误:', error);
    res.status(500).json({ error: '更新线索失败' });
  }
});

// 删除线索
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM clues WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '线索未找到' });
    }
    
    res.json({ message: '线索删除成功' });
  } catch (error) {
    console.error('删除线索错误:', error);
    res.status(500).json({ error: '删除线索失败' });
  }
});

module.exports = router;