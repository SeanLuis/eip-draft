#!/bin/bash
# Setup script for local development
# Run from documentation-site directory: ./scripts/setup.sh

set -e

echo "Setting up documentation site for local development..."

# Copy images
echo "Copying images..."
mkdir -p public/images
cp -r ../assets/erc-7893/images/* public/images/

# Copy and process docs
echo "Processing documentation files..."
mkdir -p src/content/docs
for file in ../assets/erc-7893/docs/*.md; do
  filename=$(basename "$file")
  title=$(echo "$filename" | sed 's/-/ /g' | sed 's/.md//' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1')
  {
    echo "---"
    echo "title: \"$title\""
    echo "---"
    echo ""
    # Fix image paths
    sed 's|\.\./images/|/images/|g' "$file"
  } > "src/content/docs/$filename"
done

echo "Setup complete! Run 'pnpm run dev' to start the development server."
