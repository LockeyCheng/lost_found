import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Delete as DeleteIcon, AddPhotoAlternate as AddPhotoIcon } from '@mui/icons-material';
import { itemAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreateItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    lost_date: '',
    lost_location: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 如果没有登录，重定向到登录页面
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      
      // 检查图片数量限制
      if (images.length + newImages.length > 5) {
        setError('最多只能上传5张图片');
        return;
      }

      // 检查文件大小
      const oversizedFiles = newImages.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError('图片大小不能超过5MB');
        return;
      }

      // 添加新图片
      setImages(prev => [...prev, ...newImages]);
      
      // 创建预览
      newImages.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证必填字段
    if (!formData.title || !formData.lost_date) {
      setError('标题和遗失日期为必填项');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // 添加表单数据
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });

      // 添加图片
      images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      await itemAPI.createItem(formDataToSend);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '创建物品失败');
      console.error('创建物品失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    '钱包', '手机', '证件', '钥匙', '书籍', 
    '电子产品', '衣物', '首饰', '其他'
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            登记遗失物品
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            请填写物品详细信息，帮助他人识别和寻找
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* 物品标题 */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="title"
                  label="物品名称 *"
                  variant="outlined"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  helperText="请简要描述物品，如'黑色钱包'、'iPhone手机'等"
                />
              </Grid>

              {/* 物品描述 */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="详细描述"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="请详细描述物品特征、内含物品、特殊标记等"
                />
              </Grid>

              {/* 分类和日期 */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>分类</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="分类"
                    onChange={handleSelectChange}
                    disabled={loading}
                  >
                    <MenuItem value="">请选择分类</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="lost_date"
                  label="遗失日期 *"
                  type="date"
                  variant="outlined"
                  value={formData.lost_date}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* 遗失地点 */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="lost_location"
                  label="遗失地点"
                  variant="outlined"
                  value={formData.lost_location}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="请尽量详细描述遗失地点，如'图书馆三楼自习区靠窗位置'"
                />
              </Grid>

              {/* 图片上传 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  上传图片（最多5张，每张不超过5MB）
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    disabled={loading || images.length >= 5}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AddPhotoIcon />}
                      disabled={loading || images.length >= 5}
                    >
                      选择图片
                    </Button>
                  </label>
                  
                  {images.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                      已选择 {images.length} 张图片
                    </Typography>
                  )}
                </Box>

                {/* 图片预览 */}
                {imagePreviews.length > 0 && (
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    {imagePreviews.map((preview, index) => (
                      <Grid item key={index}>
                        <Box position="relative">
                          <img
                            src={preview}
                            alt={`预览 ${index + 1}`}
                            style={{
                              width: 100,
                              height: 100,
                              objectFit: 'cover',
                              borderRadius: 8,
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              backgroundColor: 'white',
                              '&:hover': { backgroundColor: 'grey.100' },
                            }}
                            onClick={() => removeImage(index)}
                            disabled={loading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <Chip
                            label={`${(images[index].size / 1024 / 1024).toFixed(2)}MB`}
                            size="small"
                            sx={{
                              position: 'absolute',
                              bottom: 4,
                              left: 4,
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* 提交按钮 */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ flex: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : '提交登记'}
              </Button>
            </Box>
          </form>

          {/* 提示信息 */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.contrastText">
              💡 提示：
            </Typography>
            <Typography variant="body2" color="info.contrastText" sx={{ mt: 0.5 }}>
              1. 请尽量提供详细准确的物品信息，有助于他人识别
            </Typography>
            <Typography variant="body2" color="info.contrastText">
              2. 上传清晰的物品图片可以大大提高找回几率
            </Typography>
            <Typography variant="body2" color="info.contrastText">
              3. 物品找到后请及时更新状态为"已找到"或"已归还"
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateItemPage;