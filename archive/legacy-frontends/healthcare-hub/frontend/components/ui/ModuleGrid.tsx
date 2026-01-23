"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star,
  Users,
  Activity,
  TrendingUp,
  Eye,
  ArrowRight,
  Plus,
  Settings,
  Download,
  Share2,
  Bookmark,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Video,
  Heart,
  Award,
  GraduationCap,
  Workflow,
  Smartphone,
  Database,
  Cloud,
  Globe,
  Shield,
  MessageSquare,
  Camera,
  Building,
  FileText,
  CreditCard,
  HeadphonesIcon,
  ClipboardList,
  Package,
  Warehouse,
  Cog,
  Zap,
  Target,
  BarChart3,
  Calendar,
  Bell,
  Star as StarIcon
} from 'lucide-react';
import { Module } from '@/interfaces/common';
import { CommonUtils } from '@/shar@/utils/common';

interface ModuleGridProps {
  modules: Module[];
  onModuleClick?: (module: Module) => void;
  onSearch?: (query: string) => void;
  onFilter?: (category: string) => void;
  loading?: boolean;
  error?: string;
}

export const ModuleGrid: React.FC<ModuleGridProps> = ({
  modules,
  onModuleClick,
  onSearch,
  onFilter,
  loading = false,
  error = null
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['all', ...Array.from(new Set(modules.map(m => m.category)))];

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleFilter = (category: string) => {
    setSelectedCategory(category);
    onFilter?.(category);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Modules</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => handleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Modules Grid */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
      }>
        {filteredModules.map((module) => (
          <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {module.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {module.isNew && <Badge variant="secondary" className="text-xs">New</Badge>}
                  {module.isPopular && <Badge variant="default" className="text-xs">Popular</Badge>}
                  {module.isRecommended && <Badge variant="outline" className="text-xs">Recommended</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Status and Metrics */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={module.status === 'active' ? 'default' : 'secondary'}
                    className={CommonUtils.getStatusColor(module.status)}
                  >
                    {module.status}
                  </Badge>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{module.users}</span>
                  </div>
                </div>

                {/* Performance */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Performance</span>
                    <span>{module.performance}%</span>
                  </div>
                  <Progress value={module.performance} className="h-2" />
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(module.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{module.rating}/5</span>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {module.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {module.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{module.features.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Last Updated */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Updated {CommonUtils.formatDate(module.lastUpdated)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onModuleClick?.(module)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-8">
          <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};
