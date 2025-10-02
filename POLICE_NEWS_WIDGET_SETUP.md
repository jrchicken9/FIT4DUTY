# Police News Widget Setup Guide

## Overview
The Police News Widget provides users with relevant police and law enforcement news based on their location. It uses location services to fetch local news and falls back to general police news when location is not available.

## Features
- **Location-based News**: Uses user's location to fetch relevant local police news
- **Police Recruitment Focus**: Prioritizes police recruitment and law enforcement news
- **Real-time Updates**: Refreshes news content with pull-to-refresh
- **Fallback Content**: Shows mock data when API is unavailable
- **Category Icons**: Visual indicators for different news categories
- **External Links**: Opens articles in browser for full reading

## Setup Instructions

### 1. News API Configuration

The widget uses the NewsAPI.org service. To enable real news:

1. **Get API Key**:
   - Visit [https://newsapi.org/](https://newsapi.org/)
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Update API Key**:
   - Open `components/PoliceNewsWidget.tsx`
   - Replace `'YOUR_NEWS_API_KEY'` with your actual API key:
   ```typescript
   const NEWS_API_KEY = 'your_actual_api_key_here';
   ```

### 2. Location Permissions

Location permissions are already configured in `app.json`:

**iOS**:
```json
"NSLocationWhenInUseUsageDescription": "We use your location to suggest nearby police services for your résumé and cover letter."
```

**Android**:
```json
"permissions": [
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_FINE_LOCATION"
]
```

### 3. Widget Integration

The widget is already integrated into the dashboard and will:
- Request location permission on first use
- Fetch news based on user's location
- Show local news when location is available
- Fall back to general police news when location is not available
- Display mock data when API is not configured

## News Categories

The widget categorizes news into different types with visual icons:

- **Recruitment** (👥): Police recruitment drives and hiring news
- **Training** (🛡️): Training programs and educational content
- **Community** (📈): Community policing and engagement
- **General** (📰): General law enforcement news

## API Usage

### Free Tier Limits
- NewsAPI.org free tier: 1,000 requests per day
- Rate limiting: 100 requests per day for development

### Query Structure
The widget searches for:
```
"police recruitment OR law enforcement OR police department" + location
```

### Location Integration
- Uses reverse geocoding to get city/region names
- Adds location to search query for local relevance
- Falls back to general search if location unavailable

## Fallback Content

When the API is not configured or unavailable, the widget shows mock data including:
- Ontario Police Services recruitment news
- Training program updates
- Community policing initiatives

## Customization

### Adding More News Sources
You can modify the search query in `fetchNews()` function:

```typescript
let query = 'police recruitment OR law enforcement OR police department';
// Add more terms as needed
```

### Changing News Categories
Update the `getCategoryIcon()` function to add new categories:

```typescript
const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'new_category':
      return <NewIcon size={16} color={Colors.primary} />;
    // ... existing cases
  }
};
```

### Styling
The widget uses the app's color scheme defined in `constants/colors.ts`. You can customize:
- Header colors and styling
- Article card appearance
- Loading and error states

## Troubleshooting

### Location Permission Denied
- Widget will show general police news
- No error message displayed to user
- Location icon shows "General News" instead of "Local News"

### API Key Issues
- Widget falls back to mock data
- No error interruption to user experience
- Check console for API error messages

### Network Issues
- Graceful fallback to mock data
- Retry button available for manual refresh
- Loading states provide user feedback

## Future Enhancements

Potential improvements for the news widget:
1. **Caching**: Store news locally for offline access
2. **Push Notifications**: Alert users to breaking police news
3. **Bookmarking**: Allow users to save interesting articles
4. **Sharing**: Share articles via social media
5. **Customization**: Let users choose news categories
6. **Multiple Sources**: Integrate additional news APIs

## Security Notes

- API key is stored in client-side code (acceptable for public news API)
- Location data is only used for news queries, not stored
- No sensitive user data is transmitted to news API
- All external links open in browser (user's choice)

## Support

For issues with the news widget:
1. Check console for error messages
2. Verify API key is correctly set
3. Test location permissions
4. Ensure network connectivity
5. Check NewsAPI.org service status










