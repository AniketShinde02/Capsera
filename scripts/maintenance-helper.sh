#!/bin/bash
# Maintenance Helper Script for CaptionCraft

echo "🔧 CaptionCraft Maintenance Helper"
echo "=================================="

case $1 in
  "changelog")
    echo "📝 Opening changelog for editing..."
    code docs/new_features.md
    ;;
  "api-docs")
    echo "🔌 Opening API documentation..."
    code docs/API_DOCUMENTATION.md
    ;;
  "troubleshooting")
    echo "🛠️ Opening troubleshooting guide..."
    code docs/TROUBLESHOOTING.md
    ;;
  "env-vars")
    echo "⚙️ Opening environment variables..."
    code docs/env.example
    ;;
  "deployment")
    echo "🚀 Opening deployment guides..."
    code VERCEL_DEPLOYMENT_GUIDE.md
    ;;
  "maintenance")
    echo "📚 Opening maintenance guide..."
    code docs/MAINTENANCE_GUIDE.md
    ;;
  "all")
    echo "📚 Opening all documentation files..."
    code docs/
    code README.md
    code VERCEL_DEPLOYMENT_GUIDE.md
    ;;
  *)
    echo "Usage: ./maintenance-helper.sh [changelog|api-docs|troubleshooting|env-vars|deployment|maintenance|all]"
    echo ""
    echo "Available options:"
    echo "  changelog      - Open feature changelog for updates"
    echo "  api-docs       - Open API documentation"
    echo "  troubleshooting - Open troubleshooting guide"
    echo "  env-vars       - Open environment variables template"
    echo "  deployment     - Open deployment guides"
    echo "  maintenance    - Open this maintenance guide"
    echo "  all            - Open all documentation files"
    ;;
esac
