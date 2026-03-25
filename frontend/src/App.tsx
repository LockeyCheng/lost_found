import React, { useState } from 'react';
import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  InputBase,
  Paper,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Drawer,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem as SelectMenuItem,
  Grid,
} from '@mui/material';
import {
  AddCircle as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

import TrackChangesIcon from '@mui/icons-material/TrackChanges';

import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ItemDetailPage from './pages/ItemDetailPage';
import CreateItemPage from './pages/CreateItemPage';
import CreateCluePage from './pages/CreateCluePage';



// 高级搜索抽屉组件
interface AdvancedSearchDrawerProps {
  open: boolean;
  onClose: () => void;
  onSearch: (params: { search: string; status: string; category: string }) => void;
}

const AdvancedSearchDrawer: React.FC<AdvancedSearchDrawerProps> = ({ open, onClose, onSearch }) => {
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ search: searchText, status, category });
    onClose();
  };

  return (
    <Drawer
      anchor="top"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          marginTop: '64px', // 导航栏高度
          height: 'auto',
          maxHeight: 'calc(100vh - 64px)',
          overflow: 'auto',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">高级搜索</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="搜索物品名称或描述"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="输入关键词..."
                autoFocus
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>状态</InputLabel>
                <Select
                  value={status}
                  label="状态"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <SelectMenuItem value="">全部状态</SelectMenuItem>
                  <SelectMenuItem value="lost">寻找中</SelectMenuItem>
                  <SelectMenuItem value="found">已找到</SelectMenuItem>
                  <SelectMenuItem value="returned">已归还</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>分类</InputLabel>
                <Select
                  value={category}
                  label="分类"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <SelectMenuItem value="">全部分类</SelectMenuItem>
                  <SelectMenuItem value="钱包">钱包</SelectMenuItem>
                  <SelectMenuItem value="手机">手机</SelectMenuItem>
                  <SelectMenuItem value="证件">证件</SelectMenuItem>
                  <SelectMenuItem value="钥匙">钥匙</SelectMenuItem>
                  <SelectMenuItem value="书籍">书籍</SelectMenuItem>
                  <SelectMenuItem value="其他">其他</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={onClose}>
                  取消
                </Button>
                <Button variant="contained" type="submit">
                  搜索
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Drawer>
  );
};

function App() {
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  const handleAdvancedSearchOpen = () => {
    setAdvancedSearchOpen(true);
  };

  const handleAdvancedSearchClose = () => {
    setAdvancedSearchOpen(false);
  };

  const handleSearchSubmit = (searchParams: { search: string; status: string; category: string }) => {
    // 这里可以处理搜索逻辑
    console.log('搜索参数:', searchParams);
    // 在实际应用中，这里应该触发搜索并更新页面
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearchSubmit({ search: searchQuery, status: '', category: '' });
    }
  };

  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* GitHub风格顶部导航栏 */}
        <AppBar 
          position="fixed" 
          sx={{ 
            backgroundColor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <Toolbar sx={{ minHeight: '64px' }}>
            {/* Logo和品牌 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
              <TrackChangesIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography
                variant="h6"
                component={RouterLink}
                to="/"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  textDecoration: 'none',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                找回遗失的世界
              </Typography>
            </Box>

            {/* 主导航链接 */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Button
                component={RouterLink}
                to="/"
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                首页
              </Button>
              <Button
                component={RouterLink}
                to="/items/new"
                startIcon={<AddIcon />}
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                登记失物
              </Button>
            </Box>

            {/* 搜索框 - 可伸缩下边框样式 */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              <Paper
                component="form"
                onSubmit={handleQuickSearch}
                sx={{
                  p: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: searchFocused ? 600 : 400,
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  borderBottom: '2px solid',
                  borderColor: searchFocused ? 'primary.main' : 'divider',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: searchFocused ? 'primary.main' : 'grey.400',
                  },
                }}
              >
                <IconButton
                  type="button"
                  sx={{ 
                    p: '10px',
                    color: searchFocused ? 'primary.main' : 'text.secondary',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'primary.main',
                    },
                  }}
                  aria-label="高级搜索"
                  onClick={handleAdvancedSearchOpen}
                >
                  <FilterListIcon />
                </IconButton>
                <InputBase
                  sx={{ 
                    ml: 1, 
                    flex: 1,
                    '& .MuiInputBase-input': {
                      color: 'text.primary',
                      transition: 'all 0.3s ease',
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.7,
                      },
                    },
                  }}
                  placeholder="搜索失物..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  inputProps={{ 'aria-label': '搜索失物' }}
                />
                {searchQuery && (
                  <IconButton
                    type="button"
                    sx={{ 
                      p: '6px',
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: 'text.primary',
                      },
                    }}
                    aria-label="清除搜索"
                    onClick={() => setSearchQuery('')}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton 
                  type="submit" 
                  sx={{ 
                    p: '10px',
                    color: searchFocused ? 'primary.main' : 'text.secondary',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'primary.main',
                    },
                  }} 
                  aria-label="搜索"
                >
                  <SearchIcon />
                </IconButton>
              </Paper>
            </Box>

            {/* 右侧功能区域 */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              {/* 通知按钮 */}
              <IconButton
                size="large"
                aria-label="显示通知"
                color="inherit"
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* 用户菜单 */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={handleUserMenuClick}
                  sx={{
                    p: 0,
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <ArrowDropDownIcon sx={{ color: 'text.secondary' }} />
                </IconButton>
                <Menu
                  anchorEl={userAnchorEl}
                  open={Boolean(userAnchorEl)}
                  onClose={handleUserMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 180,
                    },
                  }}
                >
                  <MenuItem component={RouterLink} to="/login" onClick={handleUserMenuClose}>
                    登录
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/register" onClick={handleUserMenuClose}>
                    注册
                  </MenuItem>
                  <MenuItem onClick={handleUserMenuClose}>个人中心</MenuItem>
                  <MenuItem onClick={handleUserMenuClose}>设置</MenuItem>
                  <MenuItem onClick={handleUserMenuClose}>退出登录</MenuItem>
                </Menu>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* 高级搜索抽屉 */}
        <AdvancedSearchDrawer
          open={advancedSearchOpen}
          onClose={handleAdvancedSearchClose}
          onSearch={handleSearchSubmit}
        />

        {/* 主要内容 - 添加顶部padding以避开固定导航栏 */}
        <Toolbar /> {/* 这个Toolbar用于占位，确保内容不被导航栏覆盖 */}
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4, flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/items/:id" element={<ItemDetailPage />} />
            <Route path="/items/new" element={<CreateItemPage />} />
            <Route path="/clues/new/:itemId" element={<CreateCluePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Box>
    </AuthProvider>
  );
}

export default App;