# Super User Content Editing System

A comprehensive content management system that allows super admins to edit all static text in the app without requiring code changes or app resubmissions.

## Features

### 🔐 Role-Based Access Control
- **Super Admin Only**: Only users with `super_admin` role can access this feature
- **Supabase RLS Protection**: Database-level security with Row Level Security policies
- **Backend Validation**: Additional server-side validation for all operations

### 📝 Content Management
- **Dynamic Text Editing**: Edit any static text displayed to end users
- **Real-time Updates**: Changes propagate instantly to all users
- **Version History**: Complete audit trail of all content changes
- **Revert Functionality**: Roll back to any previous version with one click

### 🎯 Organized Content Structure
- **Section-based Organization**: Content grouped by app sections (dashboard, application, fitness, etc.)
- **Component-level Granularity**: Edit specific UI components within sections
- **Search & Filter**: Find content quickly with search and section filtering
- **Bulk Operations**: Manage multiple content items efficiently

### 🚀 Performance & Caching
- **Intelligent Caching**: 5-minute cache duration for optimal performance
- **Real-time Subscriptions**: Live updates when content changes
- **Fallback Support**: Graceful degradation if content fails to load

## Database Schema

### `app_content_text` Table
```sql
CREATE TABLE app_content_text (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key VARCHAR(255) NOT NULL UNIQUE,
  section VARCHAR(100) NOT NULL,
  component VARCHAR(100) NOT NULL,
  current_text TEXT NOT NULL,
  description TEXT,
  last_updated_by UUID REFERENCES auth.users(id),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `app_content_text_history` Table
```sql
CREATE TABLE app_content_text_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES app_content_text(id) ON DELETE CASCADE,
  previous_text TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_reason TEXT
);
```

## Setup Instructions

### 1. Database Migration
Run the SQL migration script in your Supabase dashboard:
```sql
-- Execute the contents of supabase/migrations/create_app_content_text_table.sql
```

### 2. Initial Content Population
The migration script includes initial content for:
- Dashboard text (greetings, buttons, sections)
- Application step descriptions
- Fitness content
- Community text
- Common UI elements
- Modal text
- Tooltips

### 3. Access the Content Editor
1. Log in as a super admin user
2. Navigate to Admin Dashboard (`/admin/dashboard`)
3. Click "Content Editor" button
4. Start editing content!

## Usage Guide

### For Super Admins

#### Accessing the Content Editor
1. **Navigate to Admin Dashboard**: Go to `/admin/dashboard`
2. **Click Content Editor**: Look for the "Content Editor" button (✏️ icon)
3. **Start Editing**: The editor opens as a modal with all editable content

#### Editing Content
1. **Browse Content**: Content is organized by sections (dashboard, application, etc.)
2. **Search**: Use the search bar to find specific content
3. **Filter**: Use section filters to focus on specific areas
4. **Edit**: Click the edit icon (✏️) next to any content item
5. **Save**: Make your changes and click "Save Changes"
6. **Verify**: Changes appear instantly in the app

#### Managing Content History
1. **View History**: Click the history icon (📜) to see previous versions
2. **Revert Changes**: Click "Revert" on any historical version to restore it
3. **Audit Trail**: See who made changes and when

#### Creating New Content
1. **Click "Create New Content"**: Add new editable text to the app
2. **Fill Required Fields**:
   - **Content Key**: Unique identifier (e.g., `dashboard.new.feature`)
   - **Section**: App section (e.g., `dashboard`)
   - **Component**: UI component (e.g., `feature`)
   - **Text Content**: The actual text to display
3. **Save**: New content is immediately available for editing

### For Developers

#### Using Dynamic Content in Components

**Basic Usage:**
```tsx
import { useDynamicContent } from '@/hooks/useDynamicContent';

function MyComponent() {
  const { content, loading } = useDynamicContent('dashboard.hero.greeting', {
    fallback: 'Hello, User! 👋'
  });

  if (loading) return <Text>Loading...</Text>;
  
  return <Text>{content}</Text>;
}
```

**With Placeholders:**
```tsx
function WelcomeComponent({ userName }: { userName: string }) {
  const { content } = useDynamicContent('dashboard.hero.greeting', {
    fallback: 'Hello, {name} 👋',
    placeholders: { name: userName }
  });

  return <Text>{content}</Text>;
}
```

**Multiple Content Items:**
```tsx
function DashboardHeader() {
  const { contentMap, loading } = useMultipleDynamicContent([
    'dashboard.hero.greeting',
    'dashboard.hero.subtitle',
    'dashboard.quick_actions.start_training'
  ]);

  if (loading) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>{contentMap['dashboard.hero.greeting']}</Text>
      <Text>{contentMap['dashboard.hero.subtitle']}</Text>
      <Button title={contentMap['dashboard.quick_actions.start_training']} />
    </View>
  );
}
```

#### Content Service API

**Direct Service Usage:**
```tsx
import { contentService } from '@/lib/contentService';

// Get content with fallback
const text = await contentService.getContentWithFallback('key', 'fallback');

// Get content with placeholders
const text = await contentService.getContentWithPlaceholders('key', { name: 'John' });

// Update content (super admin only)
const result = await contentService.updateContent('key', 'new text', userId);
```

#### Content Key Naming Convention

Use a hierarchical naming structure:
```
{section}.{component}.{element}
```

Examples:
- `dashboard.hero.greeting`
- `application.step.prerequisites.title`
- `fitness.training_plan.description`
- `ui.button.save`
- `modal.upsell.title`

## Content Categories

### Dashboard Content
- Hero section greetings and subtitles
- Quick action button text
- Section titles and descriptions
- Premium feature descriptions
- Motivational content

### Application Content
- Step titles and descriptions
- Requirements and tips
- Estimated time frames
- Resource descriptions

### Fitness Content
- Training plan descriptions
- Workout titles and instructions
- Exercise descriptions
- Progress tracking text

### Community Content
- Welcome messages
- Post creation prompts
- Community guidelines

### UI Elements
- Button labels
- Loading messages
- Error messages
- Success notifications
- Confirmation dialogs

### Modal Content
- Upsell modal text
- Waiver content
- Service descriptions
- Pricing information

## Security Features

### Role-Based Access
- **Super Admin Only**: Content editing restricted to super admin role
- **Database RLS**: Row Level Security policies enforce access control
- **Backend Validation**: Server-side checks prevent unauthorized access

### Audit Trail
- **Complete History**: Every change is recorded with timestamp and user
- **Change Tracking**: See what was changed, when, and by whom
- **Revert Capability**: Roll back any change to previous versions

### Data Integrity
- **Unique Keys**: Content keys are unique to prevent conflicts
- **Validation**: Required fields ensure data completeness
- **Cascade Deletion**: History is automatically cleaned up when content is deleted

## Performance Considerations

### Caching Strategy
- **5-Minute Cache**: Content cached for 5 minutes to reduce database calls
- **Real-time Updates**: Cache invalidated when content changes
- **Fallback Support**: App continues working even if content service fails

### Optimization Tips
- **Batch Loading**: Use `useMultipleDynamicContent` for multiple items
- **Lazy Loading**: Load content only when needed
- **Placeholder Usage**: Use placeholders for dynamic content instead of multiple keys

## Troubleshooting

### Common Issues

**Content Not Loading:**
1. Check database connection
2. Verify RLS policies are correct
3. Ensure user has proper permissions
4. Check content key exists in database

**Changes Not Appearing:**
1. Clear content cache: `contentService.clearCache()`
2. Check real-time subscription is working
3. Verify content key is correct
4. Refresh the app

**Permission Denied:**
1. Verify user has `super_admin` role
2. Check Supabase RLS policies
3. Ensure user is properly authenticated

### Debug Mode
Enable debug logging by checking browser console for:
- Content loading status
- Cache hit/miss information
- Real-time update events
- Error messages

## Best Practices

### Content Management
1. **Use Descriptive Keys**: Make content keys self-documenting
2. **Group Related Content**: Use consistent section/component naming
3. **Test Changes**: Always test content changes in development first
4. **Document Changes**: Use meaningful change reasons when updating content

### Development
1. **Always Provide Fallbacks**: Ensure app works even if content fails to load
2. **Use Placeholders**: For dynamic content, use placeholders instead of multiple keys
3. **Cache Appropriately**: Use caching for performance but don't over-cache
4. **Handle Loading States**: Show appropriate loading indicators

### Security
1. **Regular Audits**: Review content changes regularly
2. **Backup Strategy**: Keep backups of important content
3. **Access Control**: Regularly review super admin permissions
4. **Monitor Changes**: Set up alerts for content changes if needed

## Future Enhancements

### Planned Features
- **Content Templates**: Pre-defined templates for common content types
- **Bulk Operations**: Edit multiple content items at once
- **Content Scheduling**: Schedule content changes for future dates
- **A/B Testing**: Test different content versions
- **Content Analytics**: Track which content is most effective
- **Export/Import**: Backup and restore content configurations

### Integration Opportunities
- **CMS Integration**: Connect with external content management systems
- **Translation Support**: Multi-language content management
- **Content Workflows**: Approval workflows for content changes
- **API Access**: REST API for external content management

## Support

For technical support or questions about the Content Editing System:
1. Check this documentation first
2. Review the database schema and RLS policies
3. Check browser console for error messages
4. Contact the development team with specific error details

---

**Note**: This system is designed for super admin use only. Regular users and admins cannot access content editing features. Always test changes in a development environment before applying to production.
