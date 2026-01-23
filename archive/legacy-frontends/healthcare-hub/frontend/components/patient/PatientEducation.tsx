"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Heart, 
  Brain, 
  Activity, 
  Search, 
  Filter,
  Play,
  Clock,
  User,
  Star,
  Share,
  Bookmark,
  BookmarkPlus,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Eye,
  ThumbsUp,
  MessageSquare,
  Calendar,
  Tag,
  Award,
  Target,
  TrendingUp,
  Lightbulb,
  Shield,
  Zap,
  Info,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface PatientEducationProps {
  patientId: string;
  patientConditions: string[];
  patientInterests: string[];
}

interface EducationalContent {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'infographic' | 'interactive';
  category: string;
  tags: string[];
  author: string;
  publishDate: string;
  readTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  views: number;
  url: string;
  thumbnail?: string;
  relatedConditions: string[];
  featured: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  content: EducationalContent[];
  progress: number;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function PatientEducation({ 
  patientId, 
  patientConditions, 
  patientInterests 
}: PatientEducationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedContent, setBookmarkedContent] = useState<string[]>([]);
  const [viewedContent, setViewedContent] = useState<string[]>([]);

  // Mock educational content
  const educationalContent: EducationalContent[] = [
    {
      id: '1',
      title: 'Understanding Hypertension: A Complete Guide',
      description: 'Learn about the causes, symptoms, and management strategies for high blood pressure. This comprehensive guide covers lifestyle changes, medications, and monitoring techniques.',
      type: 'article',
      category: 'Cardiovascular Health',
      tags: ['hypertension', 'blood pressure', 'heart health', 'lifestyle'],
      author: 'Dr. Sarah Smith, Cardiologist',
      publishDate: '2024-03-01',
      readTime: '8 min read',
      difficulty: 'intermediate',
      rating: 4.8,
      views: 1247,
      url: '/education/hypertension-guide',
      relatedConditions: ['hypertension'],
      featured: true
    },
    {
      id: '2',
      title: 'Medication Management: Best Practices',
      description: 'Essential tips for managing your medications safely and effectively. Learn about timing, interactions, and how to stay organized.',
      type: 'video',
      category: 'Medication Safety',
      tags: ['medications', 'safety', 'organization', 'compliance'],
      author: 'Pharmacy Team',
      publishDate: '2024-02-28',
      readTime: '12 min',
      difficulty: 'beginner',
      rating: 4.9,
      views: 892,
      url: '/education/medication-management',
      relatedConditions: [],
      featured: true
    },
    {
      id: '3',
      title: 'Heart-Healthy Diet: What to Eat and Avoid',
      description: 'Discover the best foods for heart health and learn which foods to limit. Includes meal planning tips and delicious recipe ideas.',
      type: 'interactive',
      category: 'Nutrition',
      tags: ['diet', 'heart health', 'nutrition', 'recipes'],
      author: 'Registered Dietitian',
      publishDate: '2024-02-25',
      readTime: '15 min',
      difficulty: 'beginner',
      rating: 4.7,
      views: 1563,
      url: '/education/heart-healthy-diet',
      relatedConditions: ['hypertension', 'heart disease'],
      featured: false
    },
    {
      id: '4',
      title: 'Exercise for Heart Health: Safe Workouts',
      description: 'Learn about safe and effective exercises for cardiovascular health. Includes beginner-friendly routines and safety guidelines.',
      type: 'video',
      category: 'Exercise',
      tags: ['exercise', 'cardio', 'fitness', 'safety'],
      author: 'Physical Therapist',
      publishDate: '2024-02-20',
      readTime: '18 min',
      difficulty: 'beginner',
      rating: 4.6,
      views: 1034,
      url: '/education/exercise-heart-health',
      relatedConditions: ['hypertension'],
      featured: false
    },
    {
      id: '5',
      title: 'Stress Management Techniques',
      description: 'Explore proven techniques for managing stress and its impact on your health. Includes breathing exercises and mindfulness practices.',
      type: 'article',
      category: 'Mental Health',
      tags: ['stress', 'mental health', 'mindfulness', 'relaxation'],
      author: 'Mental Health Specialist',
      publishDate: '2024-02-15',
      readTime: '10 min read',
      difficulty: 'beginner',
      rating: 4.8,
      views: 1342,
      url: '/education/stress-management',
      relatedConditions: ['hypertension'],
      featured: false
    }
  ];

  // Mock learning paths
  const learningPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Hypertension Management Journey',
      description: 'A comprehensive learning path to help you understand and manage your blood pressure effectively.',
      content: educationalContent.filter(c => c.relatedConditions.includes('hypertension')),
      progress: 60,
      estimatedTime: '2 hours',
      difficulty: 'intermediate'
    },
    {
      id: '2',
      title: 'Medication Safety Fundamentals',
      description: 'Learn the basics of medication safety and management.',
      content: educationalContent.filter(c => c.category === 'Medication Safety'),
      progress: 30,
      estimatedTime: '1 hour',
      difficulty: 'beginner'
    }
  ];

  const categories = ['all', ...Array.from(new Set(educationalContent.map(c => c.category)))];
  const types = ['all', ...Array.from(new Set(educationalContent.map(c => c.type)))];
  const difficulties = ['all', ...Array.from(new Set(educationalContent.map(c => c.difficulty)))];

  const filteredContent = educationalContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    const matchesType = selectedType === 'all' || content.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'all' || content.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
  });

  const recommendedContent = educationalContent.filter(content => 
    content.relatedConditions.some(condition => patientConditions.includes(condition)) ||
    content.tags.some(tag => patientInterests.includes(tag))
  );

  const handleBookmark = (contentId: string) => {
    setBookmarkedContent(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  const handleView = (contentId: string) => {
    if (!viewedContent.includes(contentId)) {
      setViewedContent(prev => [...prev, contentId]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'interactive': return <Activity className="w-4 h-4" />;
      case 'infographic': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Education</h1>
          <p className="text-gray-600 mt-2">Learn about your health and conditions with our educational resources</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search educational content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>

        {showFilters && (
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Learning Paths */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recommended Learning Paths</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map((path) => (
            <Card key={path.id} className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <Badge className={getDifficultyColor(path.difficulty)}>
                    {path.difficulty}
                  </Badge>
                </div>
                <p className="text-gray-600">{path.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{path.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${path.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{path.content.length} resources</span>
                    <span>{path.estimatedTime}</span>
                  </div>
                  <Button className="w-full">
                    Continue Learning
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Content */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Featured Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {educationalContent.filter(c => c.featured).map((content) => (
            <Card key={content.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(content.type)}
                    <Badge className={getDifficultyColor(content.difficulty)}>
                      {content.difficulty}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBookmark(content.id)}
                  >
                    {bookmarkedContent.includes(content.id) ? (
                      <Bookmark className="w-4 h-4 text-blue-600" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <CardTitle className="text-lg">{content.title}</CardTitle>
                <p className="text-gray-600 text-sm">{content.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{content.author}</span>
                    <span>{formatDate(content.publishDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {content.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {content.views}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {content.rating}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {content.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handleView(content.id)}
                  >
                    {content.type === 'video' ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Watch Now
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Read More
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recommended for You */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedContent.slice(0, 6).map((content) => (
            <Card key={content.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(content.type)}
                    <Badge className={getDifficultyColor(content.difficulty)}>
                      {content.difficulty}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBookmark(content.id)}
                  >
                    {bookmarkedContent.includes(content.id) ? (
                      <Bookmark className="w-4 h-4 text-blue-600" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <CardTitle className="text-lg">{content.title}</CardTitle>
                <p className="text-gray-600 text-sm">{content.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{content.author}</span>
                    <span>{formatDate(content.publishDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {content.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {content.views}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {content.rating}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {content.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handleView(content.id)}
                  >
                    {content.type === 'video' ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Watch Now
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Read More
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Content */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Educational Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((content) => (
            <Card key={content.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(content.type)}
                    <Badge className={getDifficultyColor(content.difficulty)}>
                      {content.difficulty}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBookmark(content.id)}
                  >
                    {bookmarkedContent.includes(content.id) ? (
                      <Bookmark className="w-4 h-4 text-blue-600" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <CardTitle className="text-lg">{content.title}</CardTitle>
                <p className="text-gray-600 text-sm">{content.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{content.author}</span>
                    <span>{formatDate(content.publishDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {content.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {content.views}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {content.rating}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {content.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handleView(content.id)}
                  >
                    {content.type === 'video' ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Watch Now
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Read More
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 