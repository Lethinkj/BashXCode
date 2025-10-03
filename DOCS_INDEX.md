# 📚 Documentation Index

Welcome to the Clan Contest Platform! This guide will help you find the right documentation for your needs.

## 🎯 Start Here

**New to the project?** Start with these:

1. **[README.md](./README.md)** - Project overview and features
2. **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
3. **[QUICK_JUDGE0_SETUP.md](./QUICK_JUDGE0_SETUP.md)** - Enable real code execution in 3 minutes

## 📖 Setup Guides

Choose based on what you need to set up:

### Database Setup
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - PostgreSQL and Supabase configuration
- Includes: Schema creation, connection strings, troubleshooting

### Code Execution Setup
- **[QUICK_JUDGE0_SETUP.md](./QUICK_JUDGE0_SETUP.md)** - Fast 3-minute setup ⚡
- **[JUDGE0_SETUP.md](./JUDGE0_SETUP.md)** - Comprehensive guide with examples
- **[JUDGE0_INTEGRATION.md](./JUDGE0_INTEGRATION.md)** - Technical details
- **[JUDGE0_COMPLETE.md](./JUDGE0_COMPLETE.md)** - Summary of what was done

### Complete Setup
- **[QUICKSTART.md](./QUICKSTART.md)** - Full platform setup from scratch
- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Setup checklist

## 🏗️ Technical Documentation

### Architecture & Design
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design decisions
- **[database-schema.sql](./database-schema.sql)** - Database schema definition

### Deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to Vercel, Netlify, or other platforms

## 🔧 Troubleshooting

### Common Issues
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solutions to common problems

### Specific Issues
- Database connection errors → [DATABASE_SETUP.md](./DATABASE_SETUP.md) + [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Judge0 API errors → [JUDGE0_SETUP.md](./JUDGE0_SETUP.md) + [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Build errors → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Deployment issues → [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📝 Content & Examples

### Sample Content
- **[SAMPLE_PROBLEMS.md](./SAMPLE_PROBLEMS.md)** - Example contest problems you can use

## 🎓 Learning Path

### For Beginners (Never used Next.js or hosted a contest platform)

1. Read [README.md](./README.md) - Understand what the platform does
2. Follow [QUICKSTART.md](./QUICKSTART.md) - Get it running locally
3. Read [SAMPLE_PROBLEMS.md](./SAMPLE_PROBLEMS.md) - See example problems
4. Try creating your first contest!
5. When ready: [QUICK_JUDGE0_SETUP.md](./QUICK_JUDGE0_SETUP.md) - Enable real code execution
6. Finally: [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to production

### For Developers (Want to understand the codebase)

1. Read [README.md](./README.md) - Feature overview
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
3. Review [database-schema.sql](./database-schema.sql) - Data model
4. Read [JUDGE0_INTEGRATION.md](./JUDGE0_INTEGRATION.md) - Code execution details
5. Explore the source code in `src/`

### For Administrators (Want to host contests)

1. Read [README.md](./README.md) - What the platform can do
2. Follow [QUICKSTART.md](./QUICKSTART.md) - Set up locally
3. Follow [QUICK_JUDGE0_SETUP.md](./QUICK_JUDGE0_SETUP.md) - Enable code execution
4. Read [SAMPLE_PROBLEMS.md](./SAMPLE_PROBLEMS.md) - Get problem ideas
5. Create test contests and try them out
6. When ready: [DEPLOYMENT.md](./DEPLOYMENT.md) - Go live

### For DevOps (Want to deploy and maintain)

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) - System overview
2. Follow [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration
3. Follow [JUDGE0_SETUP.md](./JUDGE0_SETUP.md) - API setup
4. Follow [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
5. Bookmark [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - For when things break

## 📋 Quick Reference

### Environment Variables
```env
DATABASE_URL=postgresql://...        # Your Supabase connection string
RAPIDAPI_KEY=xxxxx                   # Your Judge0 API key
RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
```

### Important Commands
```bash
npm install                # Install dependencies
npm run dev               # Start development server
npm run build             # Build for production
npm start                 # Run production build
```

### Important URLs
- Development: http://localhost:3000
- Admin Panel: http://localhost:3000/admin
- Contest List: http://localhost:3000/contests
- API Docs: Check individual files in `src/app/api/`

## 🆘 Getting Help

1. **Check**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. **Database Issues**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
3. **Code Execution Issues**: [JUDGE0_SETUP.md](./JUDGE0_SETUP.md)
4. **Deployment Issues**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📊 Status Checklist

Use this to track your setup:

- [ ] Read README.md
- [ ] Cloned/downloaded project
- [ ] Ran `npm install`
- [ ] Created `.env.local` file
- [ ] Set up Supabase database
- [ ] Ran database schema SQL
- [ ] Configured DATABASE_URL
- [ ] Tested database connection
- [ ] Signed up for Judge0 API
- [ ] Configured RAPIDAPI_KEY
- [ ] Started dev server (`npm run dev`)
- [ ] Created test contest
- [ ] Tested code submission
- [ ] Reviewed deployment guide
- [ ] Ready to go live!

## 📦 File Structure

```
clan/
├── README.md                     # Start here
├── QUICKSTART.md                 # Quick setup
├── QUICK_JUDGE0_SETUP.md         # Quick Judge0 setup
├── ARCHITECTURE.md               # System design
├── DATABASE_SETUP.md             # Database guide
├── JUDGE0_SETUP.md               # Judge0 guide (detailed)
├── JUDGE0_INTEGRATION.md         # Technical details
├── JUDGE0_COMPLETE.md            # Integration summary
├── DEPLOYMENT.md                 # Deploy guide
├── TROUBLESHOOTING.md            # Common issues
├── SAMPLE_PROBLEMS.md            # Example problems
├── SETUP_COMPLETE.md             # Setup checklist
├── database-schema.sql           # Database schema
├── .env.local.example            # Environment template
├── src/                          # Source code
│   ├── app/                      # Next.js pages
│   ├── lib/                      # Business logic
│   └── types/                    # TypeScript types
└── public/                       # Static files
```

## 🎯 Common Tasks

### I want to...

**...run the platform locally**
→ [QUICKSTART.md](./QUICKSTART.md)

**...enable real code execution**
→ [QUICK_JUDGE0_SETUP.md](./QUICK_JUDGE0_SETUP.md)

**...understand how it works**
→ [ARCHITECTURE.md](./ARCHITECTURE.md)

**...fix a database error**
→ [DATABASE_SETUP.md](./DATABASE_SETUP.md) → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**...deploy to production**
→ [DEPLOYMENT.md](./DEPLOYMENT.md)

**...create good contest problems**
→ [SAMPLE_PROBLEMS.md](./SAMPLE_PROBLEMS.md)

**...understand the Judge0 integration**
→ [JUDGE0_INTEGRATION.md](./JUDGE0_INTEGRATION.md)

## 🚀 Ready to Start?

Pick your path:
- **First time here?** → [README.md](./README.md)
- **Want to run it now?** → [QUICKSTART.md](./QUICKSTART.md)
- **Already running, need real code execution?** → [QUICK_JUDGE0_SETUP.md](./QUICK_JUDGE0_SETUP.md)
- **Ready to deploy?** → [DEPLOYMENT.md](./DEPLOYMENT.md)

Happy coding! 🎉
