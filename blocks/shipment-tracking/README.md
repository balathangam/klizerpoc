# Shipment Tracking Block

A comprehensive shipment tracking system that allows users to track orders by order number and automatically fetches detailed shipment tracking information.

## Overview

This block provides a dual-functionality system:
1. **Order Lookup**: Fetches order details and shipment information using a GraphQL query
2. **Shipment Tracking**: Automatically retrieves detailed tracking status for each shipment

## Features

- ✅ **Order Number Input**: Simple form to enter order numbers
- ✅ **Dual API Integration**: Combines order lookup and shipment tracking
- ✅ **Real-time Updates**: Shows loading states and live results
- ✅ **Error Handling**: Graceful error display for failed requests
- ✅ **Responsive Design**: Mobile-friendly interface
- ✅ **Automatic Tracking**: No manual tracking number entry required

## API Endpoints

### Primary Endpoint
```
https://edge-sandbox-graph.adobe.io/api/433b712d-00d7-4099-bc01-542a0ebcdd05/graphql
```

### GraphQL Queries

#### 1. Order Lookup Query
```graphql
query ORDER_BY_NUMBER($orderNumber: String!) {
  customer {
    orders(filter: { number: { eq: $orderNumber } }) {
      items {
        shipments {
          tracking {
            title
            number
            carrier
          }
        }
      }
    }
  }
}
```

#### 2. Shipment Tracking Mutation
```graphql
mutation MyMutation($trackingNumber: String!, $userId: String!) {
  trackShipment(input: {trackingNumber: $trackingNumber, userId: $userId}) {
    ... on TrackingResponse {
      trackingNumber
      status
      error
      details
    }
  }
}
```

## Configuration

### User ID
The system uses a fixed user ID for tracking requests:
```javascript
const userId = '605DCKAP6889';
```

### Authentication
The current implementation includes placeholder headers for authentication:
```javascript
// Add any required authentication headers here
// 'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
// 'x-api-key': 'YOUR_API_KEY',
```

## Data Flow

### 1. User Input
- User enters an order number in the form
- Form validates input and shows loading state

### 2. Order Lookup
- Sends `ORDER_BY_NUMBER` query to GraphQL API
- Retrieves order details and shipment information
- Displays order summary and shipment list

### 3. Automatic Tracking
- For each shipment with a valid tracking number:
  - Automatically calls `trackShipment` mutation
  - Uses the tracking number from the order lookup
  - Displays detailed tracking information below each shipment

### 4. Results Display
- **Order Details**: Order number and shipment count
- **Shipment Info**: Title, tracking number, and carrier
- **Tracking Details**: Status, details, and error handling

## File Structure

```
blocks/shipment-tracking/
├── shipment-tracking.js    # Main functionality
├── shipment-tracking.css   # Styling
└── README.md              # This documentation
```

## Usage

### Basic Implementation
```javascript
// The block automatically decorates when loaded
export default function decorate(block) {
    // Creates form and handles all functionality
}
```

### Form Elements
- **Input Field**: Order number entry
- **Submit Button**: Triggers order lookup
- **Loading States**: Shows progress indicators
- **Result Display**: Organized shipment information

## Styling

### CSS Classes
- `.shipment-tracking-container`: Main container (max-width: 800px)
- `.tracking-form`: Form styling with shadow and borders
- `.shipment-info`: Individual shipment display
- `.tracking-details-loading`: Loading state styling
- `.tracking-success`: Success result styling
- `.tracking-error`: Error message styling

### Responsive Design
- Mobile-friendly layout
- Adaptive padding and margins
- Flexible container widths

## Error Handling

### Network Errors
- HTTP status code validation
- Network error messages
- Graceful fallbacks

### GraphQL Errors
- API error detection
- User-friendly error messages
- Individual shipment error handling

### Data Validation
- Empty input validation
- Missing data handling
- Fallback values for undefined properties

## Browser Compatibility

- Modern browsers with ES6+ support
- Fetch API support required
- CSS Grid and Flexbox support

## Dependencies

- **Vanilla JavaScript**: No external libraries required
- **Fetch API**: For HTTP requests
- **CSS3**: For styling and animations

## Customization

### Modifying API Endpoints
Update the `API_ENDPOINT` constant in the JavaScript file:
```javascript
const API_ENDPOINT = 'YOUR_GRAPHQL_ENDPOINT';
```

### Changing User ID
Update the `userId` constant:
```javascript
const userId = 'YOUR_USER_ID';
```

### Adding Authentication
Uncomment and configure authentication headers:
```javascript
headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'x-api-key': 'YOUR_API_KEY',
}
```

### Styling Modifications
Edit the CSS file to customize:
- Colors and themes
- Layout dimensions
- Typography
- Responsive breakpoints

## Troubleshooting

### Common Issues

1. **"N/A" Values**: Check GraphQL response structure
2. **API Errors**: Verify endpoint URL and authentication
3. **No Results**: Confirm order number format and existence
4. **Styling Issues**: Check CSS class names and specificity

### Debug Mode
The system includes console logging for debugging:
- API responses
- Data processing
- Error details

## Performance Considerations

- **API Calls**: Minimized through efficient data fetching
- **Loading States**: User feedback during API requests
- **Error Boundaries**: Graceful degradation on failures
- **Responsive Updates**: Efficient DOM manipulation

## Security Notes

- Input validation on client side
- No sensitive data logging
- Secure API communication
- Error message sanitization

## Future Enhancements

- **Caching**: Store recent order lookups
- **Pagination**: Handle large order histories
- **Real-time Updates**: WebSocket integration
- **Export Functionality**: Download tracking reports
- **Multi-language Support**: Internationalization

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Modern browsers, ES6+
