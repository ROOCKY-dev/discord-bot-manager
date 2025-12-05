# Getting Started with Discord Bot Manager

Welcome to Discord Bot Manager! This guide will help you get up and running quickly.

## Quick Start (5 minutes)

### Prerequisites
- Node.js 22+
- pnpm 10+
- MySQL 8.0+ (or compatible database)
- Discord Bot Token

### Step 1: Clone the Repository

```bash
git clone https://github.com/ROOCKY-dev/discord-bot-manager.git
cd discord-bot-manager
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory with your configuration:

```bash
DATABASE_URL=mysql://user:password@localhost:3306/discord_bot
DISCORD_BOT_TOKEN=your_bot_token_here
JWT_SECRET=$(openssl rand -hex 32)
VITE_APP_ID=your_app_id
NODE_ENV=development
```

### Step 4: Initialize Database

```bash
pnpm db:push
```

### Step 5: Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
discord-bot-manager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # UI components
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database queries
│   ├── bot-commands.ts    # Bot command definitions
│   └── _core/             # Framework code
├── drizzle/               # Database schema
├── Dockerfile             # Docker configuration
└── README.md              # Full documentation
```

## Key Features

### Moderation System
- Ban, kick, warn, and mute users
- Auto-moderation with banned word filtering
- Comprehensive moderation logging
- Channel lock/unlock functionality

### Economy System
- User balance management
- XP and leveling system
- Daily rewards
- Leaderboards (balance, XP, reputation)

### Roles & Permissions
- Auto-role assignment on member join
- Button-based role assignment
- Temporary role management
- Role-based access control

### Control Website
- Real-time server statistics
- Moderation log viewer
- Economy leaderboard display
- Bot configuration panel

## Common Commands

### Development
```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm db:push      # Push database migrations
```

### Database
```bash
# View database schema
pnpm db:studio    # Open Drizzle Studio (if available)

# Reset database (caution!)
pnpm db:reset
```

## Discord Bot Setup

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Bot Manager")
4. Go to "Bot" section and click "Add Bot"
5. Copy the token and add to `.env` as `DISCORD_BOT_TOKEN`

### 2. Set Bot Permissions

Required permissions:
- Manage Messages
- Manage Members
- Manage Roles
- Send Messages
- Embed Links
- Read Message History
- Moderate Members

### 3. Invite Bot to Server

1. Go to OAuth2 > URL Generator
2. Select scopes: `bot`
3. Select permissions (see above)
4. Copy generated URL and open in browser
5. Select server and authorize

## API Endpoints

### Bot Management (tRPC)

All endpoints require authentication.

**Get Server Stats**
```typescript
trpc.bot.getServerStats.useQuery({ serverId: "123456789" })
```

**Get Moderation Logs**
```typescript
trpc.bot.getModerationLogs.useQuery({ serverId: "123456789" })
```

**Get Leaderboard**
```typescript
trpc.bot.getLeaderboard.useQuery({ 
  serverId: "123456789", 
  type: "balance" // or "xp", "reputation"
})
```

**Update Server Settings**
```typescript
trpc.bot.updateServerSettings.useMutation({
  serverId: "123456789",
  prefix: "!",
  modLogChannel: "#mod-logs"
})
```

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution**: Ensure MySQL is running
```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql

# Docker
docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0
```

### Bot Not Responding
1. Check bot token is correct
2. Verify bot has required permissions
3. Check bot is in the server
4. Review logs: `pnpm dev` output

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Docker Deployment

### Build Image
```bash
docker build -t discord-bot-manager:latest .
```

### Run Container
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=mysql://user:pass@db:3306/discord_bot \
  -e DISCORD_BOT_TOKEN=your_token \
  discord-bot-manager:latest
```

### Docker Compose
```bash
docker-compose up -d
```

## AWS Deployment

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for detailed AWS deployment instructions.

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/auth.logout.test.ts

# Watch mode
pnpm test --watch
```

## Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## Support

- **Documentation**: [README.md](./README.md)
- **AWS Deployment**: [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/ROOCKY-dev/discord-bot-manager/issues)

## License

MIT License - see [LICENSE](./LICENSE) file for details

## Next Steps

1. **Customize Bot Commands**: Edit `server/bot-commands.ts` to add custom commands
2. **Extend Database Schema**: Add new tables in `drizzle/schema.ts`
3. **Build Frontend Pages**: Create new pages in `client/src/pages/`
4. **Deploy to AWS**: Follow [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)

## Performance Tips

- Use database indexes for frequently queried fields
- Implement caching for leaderboards
- Optimize Discord.js event handlers
- Monitor memory usage with large servers

## Security Checklist

- [ ] Never commit `.env` file
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS in production
- [ ] Rotate Discord bot token regularly
- [ ] Use environment variables for all secrets
- [ ] Enable database encryption
- [ ] Implement rate limiting
- [ ] Regular security audits

Happy coding! 🚀
