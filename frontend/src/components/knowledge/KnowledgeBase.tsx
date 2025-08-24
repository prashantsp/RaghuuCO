/**
 * Knowledge Base Component
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 *
 * @description This component provides a comprehensive knowledge base with
 * searchable troubleshooting guides, video tutorials, and help documentation.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Rating,
  Alert,
  Skeleton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import {
  Search,
  Help,
  VideoLibrary,
  Article,
  Troubleshoot,
  Book,
  School,
  Star,
  StarBorder,
  ThumbUp,
  ThumbDown,
  Share,
  Bookmark,
  BookmarkBorder,
  ExpandMore,
  NavigateNext,
  Home,
  Category,
  FilterList,
  Sort,
  Download,
  Print,
  Email,
  Feedback,
  Close,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { logger } from '@/utils/logger';

/**
 * Knowledge article interface
 */
interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  rating: number;
  helpful: number;
  notHelpful: number;
  videoUrl?: string;
  attachments?: string[];
  relatedArticles: string[];
}

/**
 * Knowledge category interface
 */
interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  articleCount: number;
  subcategories: string[];
}

/**
 * Search filters interface
 */
interface SearchFilters {
  category: string;
  difficulty: string;
  tags: string[];
  dateRange: string;
  rating: number;
}

/**
 * Knowledge Base Component
 */
const KnowledgeBase: React.FC = () => {
  const theme = useTheme();
  const { isHighContrast, isReducedMotion } = useAccessibility();
  const { 
    articles, 
    categories, 
    searchArticles, 
    getArticle, 
    rateArticle, 
    markHelpful,
    loading,
    error 
  } = useKnowledgeBase();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    difficulty: '',
    tags: [],
    dateRange: '',
    rating: 0
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);
  const [recentArticles, setRecentArticles] = useState<string[]>([]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    return searchArticles(searchQuery, filters);
  }, [searchQuery, filters, articles, searchArticles]);

  // Paginated results
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return searchResults.slice(startIndex, endIndex);
  }, [searchResults, currentPage, itemsPerPage]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    logger.info('Knowledge base search', { query, filters });
  };

  // Handle article selection
  const handleArticleSelect = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    setShowArticleDialog(true);
    
    // Add to recent articles
    setRecentArticles(prev => {
      const filtered = prev.filter(id => id !== article.id);
      return [article.id, ...filtered.slice(0, 9)];
    });
    
    logger.info('Article selected', { articleId: article.id, title: article.title });
  };

  // Handle article rating
  const handleArticleRating = (articleId: string, rating: number) => {
    rateArticle(articleId, rating);
    logger.info('Article rated', { articleId, rating });
  };

  // Handle helpful feedback
  const handleHelpfulFeedback = (articleId: string, helpful: boolean) => {
    markHelpful(articleId, helpful);
    logger.info('Article feedback', { articleId, helpful });
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = (articleId: string) => {
    setBookmarkedArticles(prev => {
      if (prev.includes(articleId)) {
        return prev.filter(id => id !== articleId);
      } else {
        return [...prev, articleId];
      }
    });
  };

  // Handle filter change
  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (sortType: string) => {
    setSortBy(sortType);
    setCurrentPage(1);
  };

  // Render article card
  const renderArticleCard = (article: KnowledgeArticle) => (
    <Card 
      key={article.id} 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        transition: isReducedMotion ? 'none' : 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8]
        }
      }}
      onClick={() => handleArticleSelect(article)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {article.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {article.content.substring(0, 150)}...
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Bookmark">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmarkToggle(article.id);
                }}
              >
                {bookmarkedArticles.includes(article.id) ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
            </Tooltip>
            {article.videoUrl && (
              <Tooltip title="Video available">
                <VideoLibrary color="primary" fontSize="small" />
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip label={article.category} size="small" color="primary" variant="outlined" />
            <Chip label={article.difficulty} size="small" color="secondary" variant="outlined" />
            {article.tags.slice(0, 2).map(tag => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Rating value={article.rating} readOnly size="small" />
            <Typography variant="caption" color="text.secondary">
              {article.views} views
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Render category card
  const renderCategoryCard = (category: KnowledgeCategory) => (
    <Card 
      key={category.id}
      sx={{ 
        cursor: 'pointer',
        transition: isReducedMotion ? 'none' : 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8]
        }
      }}
      onClick={() => handleFilterChange('category', category.id)}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box sx={{ mr: 2, p: 1, bgcolor: 'primary.main', borderRadius: 1 }}>
            <School color="white" />
          </Box>
          <Box flex={1}>
            <Typography variant="h6">{category.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {category.description}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {category.articleCount} articles
          </Typography>
          <Chip label="Browse" size="small" color="primary" />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link color="inherit" href="/">
            <Home fontSize="small" />
          </Link>
          <Typography color="text.primary">Knowledge Base</Typography>
        </Breadcrumbs>
        
        <Typography variant="h3" component="h1" gutterBottom>
          Knowledge Base
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find answers, tutorials, and troubleshooting guides for the RAGHUU CO Legal Practice Management System
        </Typography>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <FilterList />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />

          {/* Filters */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  label="Difficulty"
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="views">Views</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Rating</InputLabel>
                <Select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  label="Rating"
                >
                  <MenuItem value={0}>All Ratings</MenuItem>
                  <MenuItem value={4}>4+ Stars</MenuItem>
                  <MenuItem value={3}>3+ Stars</MenuItem>
                  <MenuItem value={2}>2+ Stars</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <List dense>
              {categories.map(category => (
                <ListItem 
                  key={category.id}
                  button
                  onClick={() => handleFilterChange('category', category.id)}
                  selected={filters.category === category.id}
                >
                  <ListItemIcon>
                    <Category fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={category.name}
                    secondary={`${category.articleCount} articles`}
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <List dense>
              <ListItem button>
                <ListItemIcon>
                  <Troubleshoot fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Troubleshooting" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <VideoLibrary fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Video Tutorials" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Book fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="User Manual" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <School fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Training Modules" />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Recent Articles
            </Typography>
            <List dense>
              {recentArticles.slice(0, 5).map(articleId => {
                const article = articles.find(a => a.id === articleId);
                return article ? (
                  <ListItem key={article.id} button onClick={() => handleArticleSelect(article)}>
                    <ListItemText 
                      primary={article.title}
                      secondary={article.category}
                    />
                  </ListItem>
                ) : null;
              })}
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="All Articles" />
            <Tab label="Categories" />
            <Tab label="Video Tutorials" />
            <Tab label="Troubleshooting" />
          </Tabs>

          {loading ? (
            <Box>
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={120} sx={{ mb: 2 }} />
              ))}
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : selectedTab === 0 ? (
            // All Articles Tab
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'All Articles'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchResults.length} articles found
                </Typography>
              </Box>

              {paginatedResults.map(renderArticleCard)}

              {searchResults.length > itemsPerPage && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={Math.ceil(searchResults.length / itemsPerPage)}
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                    color="primary"
                  />
                </Box>
              )}
            </Box>
          ) : selectedTab === 1 ? (
            // Categories Tab
            <Grid container spacing={2}>
              {categories.map(renderCategoryCard)}
            </Grid>
          ) : selectedTab === 2 ? (
            // Video Tutorials Tab
            <Box>
              <Typography variant="h6" gutterBottom>
                Video Tutorials
              </Typography>
              <Grid container spacing={2}>
                {articles.filter(article => article.videoUrl).map(article => (
                  <Grid item xs={12} sm={6} md={4} key={article.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <VideoLibrary color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">{article.title}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {article.content.substring(0, 100)}...
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<PlayArrow />}
                          onClick={() => {
                            setSelectedArticle(article);
                            setShowVideoDialog(true);
                          }}
                        >
                          Watch Video
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            // Troubleshooting Tab
            <Box>
              <Typography variant="h6" gutterBottom>
                Troubleshooting Guides
              </Typography>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Common Issues</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Login Issues"
                        secondary="Problems with user authentication and login"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Document Upload Problems"
                        secondary="Issues with file uploads and document management"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Performance Issues"
                        secondary="Slow loading times and system performance"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Article Dialog */}
      <Dialog 
        open={showArticleDialog} 
        onClose={() => setShowArticleDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedArticle && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">{selectedArticle.title}</Typography>
                <IconButton onClick={() => setShowArticleDialog(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box mb={2}>
                <Box display="flex" gap={1} mb={2}>
                  <Chip label={selectedArticle.category} color="primary" />
                  <Chip label={selectedArticle.difficulty} color="secondary" />
                  {selectedArticle.tags.map(tag => (
                    <Chip key={tag} label={tag} variant="outlined" />
                  ))}
                </Box>
                <Typography variant="body1" paragraph>
                  {selectedArticle.content}
                </Typography>
                {selectedArticle.videoUrl && (
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => {
                      setShowArticleDialog(false);
                      setShowVideoDialog(true);
                    }}
                    sx={{ mb: 2 }}
                  >
                    Watch Video Tutorial
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <Rating
                    value={selectedArticle.rating}
                    onChange={(e, value) => handleArticleRating(selectedArticle.id, value || 0)}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {selectedArticle.views} views
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <Button
                    startIcon={<ThumbUp />}
                    onClick={() => handleHelpfulFeedback(selectedArticle.id, true)}
                  >
                    Helpful
                  </Button>
                  <Button
                    startIcon={<ThumbDown />}
                    onClick={() => handleHelpfulFeedback(selectedArticle.id, false)}
                  >
                    Not Helpful
                  </Button>
                  <Button startIcon={<Share />}>
                    Share
                  </Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowArticleDialog(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Video Dialog */}
      <Dialog 
        open={showVideoDialog} 
        onClose={() => setShowVideoDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedArticle && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">{selectedArticle.title}</Typography>
                <IconButton onClick={() => setShowVideoDialog(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  bgcolor: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <Typography>Video Player Placeholder</Typography>
              </Box>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {selectedArticle.content}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowVideoDialog(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default KnowledgeBase;