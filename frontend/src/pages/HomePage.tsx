import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  ThumbUp as ThumbUpIcon,
  Share as ShareIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { itemAPI } from '../services/api';
import { Link } from 'react-router-dom';

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
  clue_count: number;
  images: string[];
  created_at: string;
  // 新增属性
  reward_amount: number;
  view_count: number;
  follower_count: number;
  recommendation_count: number;
  share_count: number;
}

const HomePage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await itemAPI.getItems({
        page,
        limit: 12,
        status: status || undefined,
        category: category || undefined,
      });
      setItems(response.data.items);
      setTotalPages(response.data.pagination.pages);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载物品列表失败');
      console.error('加载物品列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, [page, status, category]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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

  if (loading && items.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 快速筛选标签 */}
      <Box display="flex" gap={1} mb={3} flexWrap="wrap" style={{marginTop: "6%"}}>
        <Chip
          label="全部"
          onClick={() => {
            setStatus('');
            setCategory('');
            setPage(1);
          }}
          color={!status && !category ? 'primary' : 'default'}
          variant={!status && !category ? 'filled' : 'outlined'}
        />
        <Chip
          label="寻找中"
          onClick={() => {
            setStatus('lost');
            setPage(1);
          }}
          color={status === 'lost' ? 'primary' : 'default'}
          variant={status === 'lost' ? 'filled' : 'outlined'}
        />
        <Chip
          label="已找到"
          onClick={() => {
            setStatus('found');
            setPage(1);
          }}
          color={status === 'found' ? 'primary' : 'default'}
          variant={status === 'found' ? 'filled' : 'outlined'}
        />
        <Chip
          label="已归还"
          onClick={() => {
            setStatus('returned');
            setPage(1);
          }}
          color={status === 'returned' ? 'primary' : 'default'}
          variant={status === 'returned' ? 'filled' : 'outlined'}
        />
        <Chip
          label="钱包"
          onClick={() => {
            setCategory('钱包');
            setPage(1);
          }}
          color={category === '钱包' ? 'primary' : 'default'}
          variant={category === '钱包' ? 'filled' : 'outlined'}
        />
        <Chip
          label="手机"
          onClick={() => {
            setCategory('手机');
            setPage(1);
          }}
          color={category === '手机' ? 'primary' : 'default'}
          variant={category === '手机' ? 'filled' : 'outlined'}
        />
        <Chip
          label="证件"
          onClick={() => {
            setCategory('证件');
            setPage(1);
          }}
          color={category === '证件' ? 'primary' : 'default'}
          variant={category === '证件' ? 'filled' : 'outlined'}
        />
        <Chip
          label="宠物"
          onClick={() => {
            setCategory('宠物');
            setPage(1);
          }}
          color={category === '宠物' ? 'primary' : 'default'}
          variant={category === '宠物' ? 'filled' : 'outlined'}
        />
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 物品列表 */}
      {items.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            暂无物品信息
          </Typography>
          <Typography variant="body2" color="text.secondary">
            尝试调整搜索条件或添加新物品
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {item.images && item.images[0] && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={`${process.env.REACT_APP_UPLOAD_URL}${item.images[0]}`}
                      alt={item.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" component="h2" noWrap>
                        {item.title}
                      </Typography>
                      <Chip
                        label={getStatusText(item.status)}
                        color={getStatusColor(item.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                      {item.description?.substring(0, 100)}
                      {item.description && item.description.length > 100 ? '...' : ''}
                    </Typography>

                    <Box sx={{ mt: 'auto' }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(item.lost_date), 'yyyy年MM月dd日', { locale: zhCN })}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {item.lost_location}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {item.owner_name || item.owner_username}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${item.clue_count} 条线索`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      {/* 新增：统计信息展示 */}
                      <Box display="flex" justifyContent="center" mt={2} pt={1} borderTop={1} borderColor="divider">
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box display="flex" alignItems="center" title="浏览量">
                            <VisibilityIcon fontSize="small" sx={{ fontSize: '0.8rem', color: 'text.secondary', mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {item.view_count}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center" title="关注">
                            <FavoriteIcon fontSize="small" sx={{ fontSize: '0.8rem', color: 'error.main', mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {item.follower_count}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center" title="推荐">
                            <ThumbUpIcon fontSize="small" sx={{ fontSize: '0.8rem', color: 'primary.main', mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {item.recommendation_count}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center" title="转发">
                            <ShareIcon fontSize="small" sx={{ fontSize: '0.8rem', color: 'success.main', mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {item.share_count}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box display="flex" justifyContent="center" alignItems="center">
                          悬赏金额：
                        <Typography variant="caption" color="warning.main" fontWeight="bold">
                          ¥{(item.reward_amount*1).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      size="small"
                      component={Link}
                      to={`/items/${item.id}`}
                      fullWidth
                      variant="outlined"
                    >
                      查看详情
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* 分页 */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* 添加新物品按钮 */}
      <Box position="fixed" bottom={32} right={32}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/items/new"
          sx={{
            borderRadius: '50%',
            width: 56,
            height: 56,
            minWidth: 0,
            boxShadow: 3,
          }}
        >
          +
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;