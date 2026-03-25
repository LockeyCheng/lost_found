import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { itemAPI, clueAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Item {
  id: number;
  title: string;
  description: string;
  category: string;
  lost_date: string;
  lost_location: string;
  status: 'lost' | 'found' | 'returned';
  owner_username: string;
  owner_name: string;
  owner_phone?: string;
  owner_email?: string;
  images: string[];
  created_at: string;
}

interface Clue {
  id: number;
  description: string;
  location: string;
  image_url: string;
  created_at: string;
  username: string;
  full_name: string;
}

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [item, setItem] = useState<Item | null>(null);
  const [clues, setClues] = useState<Clue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const itemResponse = await itemAPI.getItem(id!);
      setItem(itemResponse.data.item);
      
      const cluesResponse = await clueAPI.getCluesByItem(id!);
      setClues(cluesResponse.data.clues);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载物品详情失败');
      console.error('加载物品详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'lost' | 'found' | 'returned') => {
    try {
      await itemAPI.updateItemStatus(id!, newStatus);
      setItem(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) {
      setError(err.response?.data?.error || '更新状态失败');
    }
  };

  const handleDeleteItem = async () => {
    try {
      await itemAPI.deleteItem(id!);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '删除物品失败');
    }
  };

  const handleDeleteClue = async (clueId: number) => {
    try {
      await clueAPI.deleteClue(clueId.toString());
      setClues(prev => prev.filter(clue => clue.id !== clueId));
    } catch (err: any) {
      setError(err.response?.data?.error || '删除线索失败');
    }
  };

  const openImageDialog = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !item) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || '物品不存在'}
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
    <Container maxWidth="lg">
      {/* 返回按钮 */}
      <Box sx={{ mt: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          返回列表
        </Button>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 左侧：物品信息 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h4" component="h1">
                {item.title}
              </Typography>
              <Chip
                label={getStatusText(item.status)}
                color={getStatusColor(item.status) as any}
                size="medium"
              />
            </Box>

            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              分类: {item.category}
            </Typography>

            <Typography variant="body1" paragraph sx={{ mt: 2, mb: 3 }}>
              {item.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* 物品详情 */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      遗失日期
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(item.lost_date), 'yyyy年MM月dd日', { locale: zhCN })}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      遗失地点
                    </Typography>
                    <Typography variant="body2">
                      {item.lost_location}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* 状态管理按钮 */}
            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <Button
                variant={item.status === 'lost' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => handleStatusUpdate('lost')}
                disabled={item.status === 'lost'}
              >
                标记为寻找中
              </Button>
              <Button
                variant={item.status === 'found' ? 'contained' : 'outlined'}
                color="warning"
                onClick={() => handleStatusUpdate('found')}
                disabled={item.status === 'found'}
              >
                标记为已找到
              </Button>
              <Button
                variant={item.status === 'returned' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => handleStatusUpdate('returned')}
                disabled={item.status === 'returned'}
              >
                标记为已归还
              </Button>
            </Box>
          </Paper>

          {/* 线索列表 */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" component="h2">
                相关线索 ({clues.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={Link}
                to={`/clues/new/${item.id}`}
              >
                提供线索
              </Button>
            </Box>

            {clues.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  暂无相关线索
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  如果您有相关信息，请点击上方按钮提供线索
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {clues.map((clue) => (
                  <Grid item xs={12} key={clue.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="subtitle1" gutterBottom>
                              来自: {clue.full_name || clue.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(clue.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                            </Typography>
                          </Box>
                          {user?.username === clue.username && (
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClue(clue.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                        
                        <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                          {clue.description}
                        </Typography>

                        {clue.location && (
                          <Box display="flex" alignItems="center" mb={1}>
                            <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {clue.location}
                            </Typography>
                          </Box>
                        )}

                        {clue.image_url && (
                          <Box sx={{ mt: 2 }}>
                            <CardMedia
                              component="img"
                              height="140"
                              image={`${process.env.REACT_APP_UPLOAD_URL}${clue.image_url}`}
                              alt="线索图片"
                              sx={{ cursor: 'pointer', borderRadius: 1 }}
                              onClick={() => openImageDialog(clue.image_url)}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* 右侧：图片和失主信息 */}
        <Grid item xs={12} md={4}>
          {/* 物品图片 */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              物品图片
            </Typography>
            
            {item.images && item.images.length > 0 ? (
              <Grid container spacing={1}>
                {item.images.map((image, index) => (
                  <Grid item xs={6} key={index}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={`${process.env.REACT_APP_UPLOAD_URL}${image}`}
                      alt={`物品图片 ${index + 1}`}
                      sx={{ cursor: 'pointer', borderRadius: 1 }}
                      onClick={() => openImageDialog(image)}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  暂无图片
                </Typography>
              </Box>
            )}
          </Paper>

          {/* 失主信息 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              失主信息
            </Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  用户名
                </Typography>
                <Typography variant="body2">
                  {item.owner_username}
                </Typography>
              </Box>
            </Box>

            {item.owner_name && (
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    姓名
                  </Typography>
                  <Typography variant="body2">
                    {item.owner_name}
                  </Typography>
                </Box>
              </Box>
            )}

            {item.owner_phone && (
              <Box display="flex" alignItems="center" mb={2}>
                <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    电话
                  </Typography>
                  <Typography variant="body2">
                    {item.owner_phone}
                  </Typography>
                </Box>
              </Box>
            )}

            {item.owner_email && (
              <Box display="flex" alignItems="center" mb={2}>
                <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    邮箱
                  </Typography>
                  <Typography variant="body2">
                    {item.owner_email}
                  </Typography>
                </Box>
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary">
                发布时间
              </Typography>
              <Typography variant="body2">
                {format(new Date(item.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
              </Typography>
            </Box>

            {/* 删除按钮（仅限物品所有者） */}
            {user?.username === item.owner_username && (
              <Box sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  删除此物品
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 图片查看对话框 */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <img
            src={`${process.env.REACT_APP_UPLOAD_URL}${selectedImage}`}
            alt="查看图片"
            style={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除这个物品吗？此操作不可撤销，所有相关线索也将被删除。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleDeleteItem} color="error" variant="contained">
            确认删除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ItemDetailPage;