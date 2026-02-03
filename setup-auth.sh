#!/bin/bash

# Quick setup script for NextAuth environment variables

echo "🔐 NextAuth Setup Helper"
echo "========================"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

# Generate NextAuth secret
echo "🔑 Generating NEXTAUTH_SECRET..."
SECRET=$(openssl rand -base64 32)

# Get port from user or use default
read -p "Enter the port your app runs on (default: 3001): " PORT
PORT=${PORT:-3001}

# Get GitHub credentials
echo ""
echo "📝 Please provide your GitHub OAuth credentials"
echo "   (Get them from: https://github.com/settings/developers)"
echo ""
read -p "GitHub Client ID: " GITHUB_ID
read -p "GitHub Client Secret: " GITHUB_SECRET

# Create .env.local file
cat > .env.local << EOF
# NextAuth Configuration
NEXTAUTH_SECRET=$SECRET
NEXTAUTH_URL=http://localhost:$PORT

# GitHub OAuth
GITHUB_ID=$GITHUB_ID
GITHUB_SECRET=$GITHUB_SECRET
EOF

echo ""
echo "✅ .env.local file created successfully!"
echo ""
echo "📋 Your configuration:"
echo "   NEXTAUTH_URL: http://localhost:$PORT"
echo "   NEXTAUTH_SECRET: (generated)"
echo "   GITHUB_ID: $GITHUB_ID"
echo ""
echo "⚠️  IMPORTANT: Make sure your GitHub OAuth App has this callback URL:"
echo "   http://localhost:$PORT/api/auth/callback/github"
echo ""
echo "🚀 You're all set! Run 'npm run dev' to start your app."
