#!/bin/bash

# Script to fix all localhost:5000 references to production API
echo "🔧 Fixing API URLs in frontend files..."

# Find and replace all localhost:5000 references
find frontend/src -name "*.js" -o -name "*.jsx" | xargs sed -i 's|http://localhost:5000/api|https://api.ozarx.in/api|g'

# Also fix any hardcoded localhost references
find frontend/src -name "*.js" -o -name "*.jsx" | xargs sed -i 's|localhost:5000|api.ozarx.in|g'

echo "✅ API URLs updated to production!"
echo "🌍 All API calls now point to: https://api.ozarx.in/api"







