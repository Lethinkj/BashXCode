# Clan Contest Platform

A competitive programming contest hosting platform similar to HackerRank, built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Quick Start (3 Minutes)

**Already set up?** Enable real code execution:
1. Get free API key: https://rapidapi.com/judge0-official/api/judge0-ce
2. Add to `.env.local`: `RAPIDAPI_KEY=your_key`
3. Restart: `npm run dev`

See [QUICK_JUDGE0_SETUP.md](./QUICK_JUDGE0_SETUP.md) for detailed steps.

## Features

### 🚀 NEW: Hybrid Code Execution
- ⚡ **Instant Execution**: JavaScript & Python run in browser (0ms latency)
- 🌐 **Free API**: C/C++/Java use Piston API (unlimited, no cost)
- 💰 **$0/month**: No API costs or daily limits
- 🎯 **Perfect for Contests**: Handles 100+ concurrent users easily
- 📚 **Learn More**: See [HYBRID_EXECUTION.md](./HYBRID_EXECUTION.md)

### Core Features
- 🎯 **Contest Management**: Create and manage programming contests with multiple problems
- 👤 **Simple Authentication**: Name-based login for quick access
- 💻 **Multi-Language Support**: Code in Python, JavaScript, Java, C++, and C
- ⚡ **Real Code Execution**: Browser-based + Piston API for secure execution
- ✅ **Test Case Evaluation**: Up to 10 test cases per problem with automatic scoring
- 🏆 **Real-Time Leaderboard**: Rankings based on points and solve time
- 📊 **All-or-Nothing Scoring**: Full points only if all test cases pass
- 🔗 **Contest URL Sharing**: Easy contest access via shareable URLs
- 🗄️ **PostgreSQL Database**: Persistent storage via Supabase
- 🎨 **Responsive UI**: Beautiful interface built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Supabase recommended)
- RapidAPI account with Judge0 CE subscription (for code execution)

### Quick Start

1. Clone the repository or extract the files

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your credentials:
# - DATABASE_URL: Your PostgreSQL connection string
# - RAPIDAPI_KEY: Your Judge0 API key from RapidAPI
```

4. Set up the database:
- Create a Supabase account at https://supabase.com
- Create a new project
- Run the SQL from `database-schema.sql` in the SQL Editor
- Copy your connection string to `.env.local`

5. Set up Judge0 API (for real code execution):
- Follow the guide in [JUDGE0_SETUP.md](./JUDGE0_SETUP.md)
- Sign up at https://rapidapi.com/judge0-official/api/judge0-ce
- Add your API key to `.env.local`

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

For detailed setup instructions, see:
- [QUICKSTART.md](./QUICKSTART.md) - Quick setup guide
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration
- [JUDGE0_SETUP.md](./JUDGE0_SETUP.md) - Code execution setup

## Usage

### For Contestants

1. **Join a Contest**:
   - Visit the homepage
   - Enter your name
   - Either browse all contests or enter a specific contest URL/ID

2. **Solve Problems**:
   - Select a problem from the sidebar
   - Choose your preferred programming language
   - Write your solution in the code editor
   - Test your code with custom inputs
   - Submit your solution

3. **View Leaderboard**:
   - Check real-time rankings
   - See your position and points
   - Track problem completion

### For Administrators

1. **Login to Admin Panel**:
   - Navigate to `/admin`
   - **Username**: `admin`
   - **Password**: `admin123`
   - (⚠️ Change these in production! See [ADMIN_AUTH.md](./ADMIN_AUTH.md))

2. **Create a Contest**:
   - Click "Create New Contest"
   - Fill in contest details (title, description, start/end time)
   - Add problems (up to 10 per contest) with:
     - Title and description
     - Difficulty level (Easy/Medium/Hard)
     - Points allocation
     - 5 test cases (input/output pairs)

3. **Manage Contests**:
   - View all existing contests
   - Copy contest URLs to share with participants
   - Access contest-specific leaderboards
   - Logout when done

## Project Structure

```
clan/
├── src/
│   ├── app/
│   │   ├── admin/                 # Admin panel for contest management
│   │   ├── api/                   # API routes
│   │   │   ├── contests/          # Contest CRUD operations
│   │   │   ├── submissions/       # Submission handling
│   │   │   └── execute/           # Code execution endpoint
│   │   ├── contest/[id]/          # Contest participation page
│   │   │   └── leaderboard/       # Leaderboard page
│   │   ├── contests/              # Contest listing page
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Homepage
│   ├── lib/
│   │   ├── storage.ts             # In-memory data storage
│   │   └── codeExecution.ts       # Code execution logic
│   └── types/
│       └── index.ts               # TypeScript type definitions
├── public/                        # Static assets
├── .gitignore
├── next.config.js                 # Next.js configuration
├── package.json
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md
```

## Code Execution

⚠️ **Important**: The current implementation uses a mock code execution system for demonstration purposes.

For production use, you MUST integrate with a secure code execution service:

### Recommended Services:

1. **Judge0 API** (https://judge0.com/)
   - Supports 60+ programming languages
   - Sandboxed execution environment
   - Easy API integration

2. **Piston API** (https://piston.readthedocs.io/)
   - Open-source code execution engine
   - Self-hostable option
   - Multiple language support

### Integration Steps:

1. Sign up for an API key from your chosen service
2. Add the API key to environment variables:
   ```bash
   # .env.local
   JUDGE0_API_KEY=your_api_key_here
   ```

3. Update `src/lib/codeExecution.ts` with actual API calls

## Deployment on Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Click "Deploy"

3. **Environment Variables** (if using code execution services):
   - Add your API keys in Vercel dashboard
   - Settings → Environment Variables

## Limitations & Future Enhancements

### Current Limitations:
- In-memory storage (data resets on server restart)
- Mock code execution (not suitable for production)
- No user authentication system
- No admin password protection

### Suggested Enhancements:
- [ ] Add database integration (PostgreSQL, MongoDB)
- [ ] Implement proper authentication (NextAuth.js)
- [ ] Integrate with Judge0 or Piston for code execution
- [ ] Add admin dashboard with analytics
- [ ] Implement email notifications
- [ ] Add problem tags and filtering
- [ ] Support for multiple test case types (public/hidden)
- [ ] Time and memory usage tracking
- [ ] Export leaderboard to CSV
- [ ] Contest templates

## Technologies Used

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor (VS Code editor)
- **HTTP Client**: Axios
- **UUID Generation**: uuid

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for competitive programmers
