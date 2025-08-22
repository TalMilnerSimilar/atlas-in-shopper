#!/bin/bash

echo "🚀 Deploying Atlas in Shopper to Netlify..."

# Build the project
echo "📦 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Static files are ready in the 'out' directory"
    echo ""
    echo "🌐 Next steps:"
    echo "1. Go to https://app.netlify.com/"
    echo "2. Click 'Add new site' → 'Deploy manually'"
    echo "3. Drag and drop the 'out' folder"
    echo "4. Your site will be live!"
    echo ""
    echo "Or use GitHub integration:"
    echo "1. Go to https://app.netlify.com/"
    echo "2. Click 'Add new site' → 'Import an existing project'"
    echo "3. Choose 'Deploy with GitHub'"
    echo "4. Select your 'atlas-in-shopper' repository"
    echo "5. Build command: npm run build"
    echo "6. Publish directory: out"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
