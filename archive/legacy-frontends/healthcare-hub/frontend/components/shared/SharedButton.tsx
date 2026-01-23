/**
 * Example: Using Shared UI Package
 * 
 * This is an example of how to use the shared UI package
 * in legacy apps. You can gradually replace local components
 * with shared ones.
 */

// Option 1: Import from shared package
import { Button } from '@healthcare-saas/ui';

// Option 2: Re-export for easier migration
export { Button } from '@healthcare-saas/ui';

// Example usage:
// import { Button } from '@/components/shared/SharedButton';
// <Button variant="primary">Click me</Button>
