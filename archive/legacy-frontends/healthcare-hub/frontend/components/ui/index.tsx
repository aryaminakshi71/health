"use client";

// UI Components Index
// This file exports all UI components for easier imports

// Basic UI Components
export { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Card';
export { Button } from './Button';
export { Badge } from './Badge';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
export { Input } from './Input';
export { Textarea } from './Textarea';
export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './Select';
export { Progress } from './Progress';
export { Label } from './label';

// Enhanced Components
export { LoadingSpinner, LoadingSkeleton, StatusIndicator } from './LoadingStates';
export { NotificationProvider, useNotifications } from './NotificationSystem';
export { ErrorBoundary, ProgressBar, Tooltip, Modal, Notification } from './EnhancedUI';

// Layout Components
export { Footer } from '../../layouts/Footer';
export { Header } from '../../layouts/Header';
export { Navigation } from '../../layouts/Navigation';
export { Sidebar } from '../../layouts/Sidebar';

// Form Components
export { Form } from './forms/Form';

// Data Display Components
export { Table as DataTable } from './data-display/Table';
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';

// Utility Components
export { AccessibleButton } from './AccessibleButton';
export { AnimatedContainer } from './AnimatedContainer';
export { ThemeProvider } from './ThemeProvider'; 