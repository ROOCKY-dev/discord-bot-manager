# Discord Bot Manager

A comprehensive Discord bot management platform with moderation, economy, roles, and utility features. Includes a unique control website for managing all bot functions across your Discord servers.

## Features

### Moderation & Security
- Anti-spam detection and muting
- Auto-moderation with banned word filtering
- Ban, kick, mute, and timeout functionality
- Warning system with auto-kick at 3 warnings
- Comprehensive moderation logging
- Channel lock/unlock capabilities
- Message purge/bulk delete

### Roles & Permissions
- Auto-role assignment on member join
- Button-based role assignment
- Temporary role management (24-hour roles)
- Sticky roles (remember roles after rejoin)
- Role-based access control

### Economy System
- Virtual currency with balance management
- XP and leveling system
- Daily rewards
- Leaderboards (balance, XP, reputation)
- Transaction history tracking
- Reputation points system

### Utility Features
- AFK status management
- Scheduled announcements
- Embed message builder
- Forms and applications system
- Giveaway management
- Polls and voting
- Reminders
- Sticky messages
- Ticket system
- Timezone support

### Control Website
- Modern dashboard with authentication
- Real-time server statistics
- Moderation log viewer
- Leaderboard display
- Bot configuration panel
- Server management interface
- Activity analytics

## Tech Stack

- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **Bot**: discord.js 14
- **Auth**: Manus OAuth
- **Deployment**: Docker + AWS

## Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL 8.0+ (or compatible database)
- Discord Bot Token
- Manus OAuth credentials

## Installation

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd discord-bot-manager
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables:
```
DATABASE_URL=mysql://user:password@localhost:3306/discord_bot
DISCORD_BOT_TOKEN=your_bot_token_here
JWT_SECRET=your_jwt_secret
VITE_APP_ID=your_app_id
```

5. Push database schema:
```bash
pnpm db:push
```

6. Start development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Docker Development

1. Build and run with Docker Compose:
```bash
docker-compose up
```

This will start both the MySQL database and the application.

## AWS Deployment

### Prerequisites
- AWS account with EC2 access
- Docker installed on EC2 instance
- RDS MySQL instance (or use managed database)

### Deployment Steps

1. Build Docker image:
```bash
docker build -t discord-bot-manager:latest .
```

2. Push to AWS ECR (Elastic Container Registry):
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag discord-bot-manager:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/discord-bot-manager:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/discord-bot-manager:latest
```

3. Deploy to EC2:
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Pull and run the image
docker pull <account-id>.dkr.ecr.us-east-1.amazonaws.com/discord-bot-manager:latest
docker run -d -p 3000:3000 \
  -e DATABASE_URL=mysql://user:pass@rds-endpoint:3306/discord_bot \
  -e DISCORD_BOT_TOKEN=your_token \
  -e JWT_SECRET=your_secret \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/discord-bot-manager:latest
```

### Using AWS ECS (Recommended)

1. Create ECS task definition with the Docker image
2. Set environment variables in task definition
3. Create ECS service with load balancer
4. Configure auto-scaling policies

## Database Schema

The application uses the following main tables:

- **users**: User authentication and profiles
- **discord_servers**: Discord server configurations
- **moderation_logs**: Moderation action history
- **user_warnings**: User warning counts
- **user_balance**: Economy system (balance, XP, level, reputation)
- **transactions**: Economy transaction history
- **user_roles**: User role assignments
- **message_logs**: Message deletion/edit logs
- **feature_settings**: Per-server feature configuration

## API Endpoints

### Bot Management (tRPC)
- `bot.getServers`: List connected servers
- `bot.getModerationLogs`: Fetch moderation logs
- `bot.getLeaderboard`: Get economy leaderboard

### Authentication
- `auth.me`: Get current user
- `auth.logout`: Logout user

## Configuration

### Bot Commands

The bot responds to commands based on the configured prefix (default: `!`):

- `!ban @user [reason]`: Ban a user
- `!kick @user [reason]`: Kick a user
- `!warn @user [reason]`: Warn a user
- `!mute @user [duration]`: Mute a user
- `!leaderboard`: Show economy leaderboard
- `!balance`: Check user balance
- `!daily`: Claim daily reward

### Server Settings

Configure per-server settings in the dashboard:
- Server prefix
- Moderation log channel
- Welcome message
- Feature toggles
- Role assignments

## Development

### Project Structure
```
discord-bot-manager/
├── client/                 # React frontend
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable components
│       └── lib/           # Utilities
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database helpers
│   └── _core/             # Core framework
├── drizzle/               # Database schema
├── Dockerfile             # Docker configuration
└── docker-compose.yml     # Local development setup
```

### Running Tests

```bash
pnpm test
```

### Building for Production

```bash
pnpm build
```

This creates optimized builds in the `dist/` directory.

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure MySQL service is running
- Check database credentials

### Discord Bot Not Responding
- Verify bot token is valid
- Ensure bot has necessary permissions
- Check bot is invited to server with correct scopes

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/discord-bot-manager/issues)
- Documentation: [Wiki](https://github.com/yourusername/discord-bot-manager/wiki)

## Roadmap

- [ ] Advanced analytics dashboard
- [ ] Custom command builder
- [ ] Integration with other services (Twitch, YouTube)
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Advanced permission system
- [ ] Custom embeds builder
- [ ] Automated moderation rules

## Security

- All sensitive data is encrypted
- Database passwords are never logged
- OAuth tokens are securely stored
- Regular security audits recommended

## Performance

- Optimized database queries
- Caching layer for frequently accessed data
- Rate limiting on API endpoints
- Efficient message processing

## Changelog

### Version 1.0.0
- Initial release
- Core moderation features
- Economy system
- Control website dashboard
- Docker deployment support
