import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { clueAPI, itemAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ItemInfo {
  id: number;
  title: string;
  status: string;
}

const CreateCluePage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [itemInfo, setItemInfo] = useState<ItemInfo | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    location: '',
  });
  
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemLoading, setItemLoading] = useState(true);

  // 如果没有登录，重定向到登录页面
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // 获取物品信息
  useEffect(() => {
    const fetchItemInfo = async () => {
      try {
        setItemLoading(true);
        const response = await itemAPI.getItem(itemId!);
        setItemInfo(response.data.item);
      } catch (err: any) {
        setError(err.response?.data?.error || '加载物品信息失败');
      } finally {
        setItemLoading(false);
      }
    };

    if (itemId) {
      fetchItemInfo();
    }
  }, [itemId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 检查文件大小
      if (file.size > 5 * 1024 * 1024) {
        setError('图片大小不能超过5MB');
        return;
      }

      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件');
        return;
      }

      setImage(file);
      
      // 创建预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证必填字段
    if (!formData.description) {
      setError('线索描述为必填项');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // 添加表单数据
      formDataToSend.append('item_id', itemId!);
      formDataToSend.append('description', formData.description);
      
      if (formData.location) {
        formDataToSend.append('location', formData.location);
      }

      // 添加图片
      if (image) {
        formDataToSend.append('image', image);
      }

      await clueAPI.createClue(formDataToSend);
      navigate(`/items/${itemId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || '提交线索失败');
      console.error('提交线索失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lost': return 'error';
      case 'found': return 'warning';
      case 'returned': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'lost': return '寻找中';
      case 'found': return '已找到';
      case 'returned': return '已归还';
      default: return status;
    }
  };

  if (itemLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!itemInfo) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            物品不存在或加载失败
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
          >
            返回首页
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* 返回按钮 */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/items/${itemId}`)}
          >
            返回物品详情
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            提供线索
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            请提供您发现的线索信息，帮助失主找回物品
          </Typography>

          {/* 物品信息卡片 */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {itemInfo.title}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      物品ID: {itemInfo.id}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={getStatusText(itemInfo.status)}
                  color={getStatusColor(itemInfo.status) as any}
                />
              </Box>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* 线索描述 */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="线索描述 *"
                  variant="outlined"
                  multiline
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  helperText="请详细描述您看到的情况、时间、地点等信息"
                  placeholder="例如：昨天下午3点左右，在图书馆三楼自习区看到类似物品..."
                />
              </Grid>

              {/* 发现地点 */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="location"
                  label="发现地点"
                  variant="outlined"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="如果您知道具体发现地点，请填写"
                  placeholder="例如：图书馆一楼失物招领处、食堂二楼清洁处等"
                />
              </Grid>

              {/* 图片上传 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  上传相关图片（可选）
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="clue-image-upload"
                    type="file"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                  <label htmlFor="clue-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AddPhotoIcon />}
                      disabled={loading}
                    >
                      选择图片
                    </Button>
                  </label>
                  
                  {image && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                      已选择1张图片 ({(image.size / 1024 / 1024).toFixed(2)}MB)
                    </Typography>
                  )}
                </Box>

                {/* 图片预览 */}
                {imagePreview && (
                  <Box position="relative" sx={{ mt: 2, display: 'inline-block' }}>
                    <img
                      src={imagePreview}
                      alt="线索图片预览"
                      style={{
                        width: 200,
                        height: 200,
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
                      onClick={removeImage}
                      disabled={loading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Grid>
            </Grid>

            {/* 提交按钮 */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/items/${itemId}`)}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ flex: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : '提交线索'}
              </Button>
            </Box>
          </form>

          {/* 提示信息 */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.contrastText">
              💡 提供线索的注意事项：
            </Typography>
            <Typography variant="body2" color="info.contrastText" sx={{ mt: 0.5 }}>
              1. 请确保提供的信息真实准确
            </Typography>
            <Typography variant="body2" color="info.contrastText">
              2. 如果可能，请尽量提供具体的时间和地点
            </Typography>
            <Typography variant="body2" color="info.contrastText">
              3. 上传的图片应清晰可见，有助于识别
            </Typography>
            <Typography variant="body2" color="info.contrastText">
              4. 您的线索将公开显示，请勿包含个人隐私信息
            </Typography>
            <Typography variant="body2" color="info.contrastText">
              5. 如果物品已找到或归还，请勿再提供新线索
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateCluePage;