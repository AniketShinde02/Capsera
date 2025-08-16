# 🚀 CAPTIONCRAFT COMMANDS REFERENCE

## 📦 Package Management Commands

### Install Dependencies
```bash
npm install
```
Installs all project dependencies from package.json

### Install Specific Package
```bash
npm install package-name
npm install package-name --save-dev  # For dev dependencies
```
Installs a specific package and adds it to dependencies

### Update Dependencies
```bash
npm update
```
Updates all packages to their latest versions within version constraints

### Check for Outdated Packages
```bash
npm outdated
```
Shows which packages are outdated

## 🚀 Development Commands

### Start Development Server
```bash
npm run dev
```
Starts the Next.js development server on localhost:9002

### Start Genkit AI Development
```bash
npm run genkit:dev
```
Starts Genkit AI development server

### Watch Mode for Genkit
```bash
npm run genkit:watch
```
Starts Genkit in watch mode for development

## 📊 Performance & Load Testing Commands

### Load Testing
```bash
npm run load-test
```
Runs comprehensive load testing with 100+ concurrent users

### Custom Load Testing
```bash
npm run load-test -- --users 200 --requests 10 --url https://yourdomain.com
```
Customize load test parameters for specific scenarios

### Performance Monitoring
```bash
npm run performance:monitor
```
Access performance monitoring dashboard and metrics

### Database Optimization
```bash
npm run db:optimize
```
Run database optimization and performance checks

## 🏗️ Build & Production Commands

### Build for Production
```bash
npm run build
```
Creates an optimized production build

### Start Production Server
```bash
npm run start
```
Starts the production server (must run build first)

## 🔍 Code Quality Commands

### Run Linting
```bash
npm run lint
```
Runs ESLint to check code quality and style

### Type Checking
```bash
npm run typecheck
```
Runs TypeScript compiler to check for type errors

## 🔐 Admin Setup Commands

### Generate Setup Token
```bash
npm run generate-token
```
Generates a new admin setup token for initial system configuration

### Setup Admin Account
```bash
npm run setup-admin
```
Runs the admin setup script (legacy command)

## 🗑️ Data Management Commands

### Clear Admin Data
```bash
npm run clear-admin
```
Clears all admin users, roles, and used tokens from the database

### Force Clear All Sessions
```bash
npm run force-clear-sessions
```
Clears all NextAuth sessions, JWT tokens, and authentication data

## 🧪 Testing Commands

### Run Tests
```bash
npm test
```
Runs the test suite (if configured)

### Run Tests in Watch Mode
```bash
npm run test:watch
```
Runs tests in watch mode for development

## 📊 Database Commands

### MongoDB Connection Test
```bash
node -e "require('./src/lib/db').connectToDatabase().then(() => console.log('✅ Connected')).catch(console.error)"
```
Tests MongoDB connection

### Check Database Collections
```bash
node -e "require('./src/lib/db').connectToDatabase().then(async ({db}) => { const cols = await db.listCollections().toArray(); console.log('Collections:', cols.map(c => c.name)); process.exit(0); }).catch(console.error)"
```
Lists all database collections

## 🏥 System Health & Monitoring Commands

### Health Check API
```bash
# Basic health check
curl https://yourdomain.com/api/health-check

# Performance metrics only
curl https://yourdomain.com/api/health-check | jq '.performance'

# Queue status
curl https://yourdomain.com/api/health-check | jq '.queue'

# Database health
curl https://yourdomain.com/api/health-check | jq '.database'
```

### Performance Monitoring
```bash
# Real-time API performance
curl https://yourdomain.com/api/health-check | jq '.performance.apiResponseTime'

# System resources
curl https://yourdomain.com/api/health-check | jq '.system.cpu, .system.memory'

# Queue metrics
curl https://yourdomain.com/api/health-check | jq '.queue.length, .queue.averageWaitTime'
```

## 🔧 Utility Commands

### Check Node Version
```bash
node --version
```
Shows current Node.js version

### Check NPM Version
```bash
npm --version
```
Shows current NPM version

### Check Environment Variables
```bash
node -e "console.log('NODE_ENV:', process.env.NODE_ENV)"
```
Shows current environment

## 🐳 Docker Commands (if using Docker)

### Build Docker Image
```bash
docker build -t captioncraft .
```
Builds Docker image from Dockerfile

### Run Docker Container
```bash
docker run -p 9002:9002 captioncraft
```
Runs the application in Docker container

### Stop Docker Container
```bash
docker stop container-id
```
Stops a running Docker container

## 📁 File System Commands

### List Project Files
```bash
ls -la
```
Lists all files in current directory

### Navigate to Project Directory
```bash
cd /path/to/Caption-Craft
```
Changes to project directory

### View File Contents
```bash
cat filename
```
Displays file contents in terminal

### Edit File (with nano)
```bash
nano filename
```
Opens file in nano editor

## 🔍 Debugging Commands

### Check Server Logs
```bash
# In development, logs appear in terminal
# In production, check your hosting platform's log system
```

### Check MongoDB Logs
```bash
# If running MongoDB locally
tail -f /var/log/mongodb/mongod.log
```

### Check Environment Variables
```bash
node -e "console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set')"
```
Checks if MongoDB URI is configured

## 🚨 Emergency Commands

### Kill All Node Processes
```bash
pkill -f node
```
Kills all running Node.js processes (use with caution)

### Reset Database (DANGEROUS)
```bash
npm run clear-admin && npm run force-clear-sessions
```
⚠️ **WARNING**: This will delete ALL admin data and sessions

### Force Restart Server
```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

## 📱 Browser Commands

### Open Development URL
```bash
# Windows
start http://localhost:9002

# macOS
open http://localhost:9002

# Linux
xdg-open http://localhost:9002
```

### Clear Browser Cache
```bash
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
# Safari: Cmd+Option+E
```

## 🔄 Git Commands (if using Git)

### Check Git Status
```bash
git status
```
Shows current git repository status

### Commit Changes
```bash
git add .
git commit -m "Your commit message"
```

### Push Changes
```bash
git push origin main
```

## 📋 Quick Reference

### Most Used Commands:
```bash
npm run dev                    # Start development
npm run generate-token         # Generate admin token
npm run clear-admin            # Clear admin data
npm run force-clear-sessions   # Clear all sessions
npm run build                  # Build for production
npm run start                  # Start production server
npm run load-test              # Load testing
npm run performance:monitor    # Performance monitoring
npm run db:optimize            # Database optimization
```

### Development Workflow:
1. `npm run dev` - Start development server
2. Make changes to code
3. `npm run lint` - Check code quality
4. `npm run typecheck` - Verify types
5. `npm run build` - Build for production
6. `npm run start` - Start production server

### Admin Setup Workflow:
1. `npm run clear-admin` - Clear existing admin data
2. `npm run force-clear-sessions` - Clear all sessions
3. `npm run generate-token` - Generate new setup token
4. Update `.env` file with new token
5. Restart server with `npm run dev`
6. Visit `/setup` to create admin account

## ⚠️ Important Notes

- **Always restart server** after changing `.env` file
- **Clear browser data** after running clear commands
- **Backup data** before running destructive commands
- **Check logs** if commands fail
- **Verify environment variables** are set correctly
