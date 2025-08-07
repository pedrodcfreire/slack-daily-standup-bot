# Slack Daily Standup Bot

AI-powered Slack bot that automates daily standup meetings and generates intelligent team reports.

## Features

- 🤖 **Automated Daily Questions**: Posts standup questions every day at 9:00 AM
- 🧠 **AI-Generated Reports**: Uses OpenAI to create intelligent summaries for team leaders
- ⏰ **Scheduled Operations**: Automatically runs daily without manual intervention
- 📊 **Real-time Processing**: Captures team responses and sends immediate reports
- 🔒 **Secure**: Environment-based configuration for sensitive tokens

## Prerequisites

- Node.js (v18 or higher)
- npm package manager
- Slack workspace with admin permissions
- OpenAI API account with credits
- ngrok (for local development)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pedrodcfreire/slack-daily-standup-bot.git
   cd slack-daily-standup-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see Configuration section below)

## Configuration

Create a `.env` file with the following variables:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
OPENAI_API_KEY=sk-proj-your-openai-key
CHANNEL_ID=your-target-channel-id
LEADER_USER_ID=team-leader-user-id
PORT=3000
NODE_ENV=development
```

### Getting Slack Credentials

1. **Create Slack App:**
   - Go to https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Choose your workspace

2. **Configure Bot Token:**
   - Go to "OAuth & Permissions"
   - Add these scopes:
     - `chat:write`
     - `users:read`
     - `channels:read`
   - Install app to workspace
   - Copy "Bot User OAuth Token" to `SLACK_BOT_TOKEN`

3. **Get Signing Secret:**
   - Go to "Basic Information"
   - Copy "Signing Secret" to `SLACK_SIGNING_SECRET`

4. **Get Channel and User IDs:**
   - Channel ID: Found in Slack channel URL
   - User ID: Right-click on team leader → "Copy member ID"

### Getting OpenAI API Key

1. Go to https://platform.openai.com/
2. Create account and add billing/credits
3. Go to "API Keys" and create new key
4. Copy to `OPENAI_API_KEY`

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### With ngrok (for Slack webhooks)
```bash
# Terminal 1
npm run dev

# Terminal 2  
ngrok http 3000
```

## How It Works

1. **Daily Scheduling**: Bot automatically posts standup questions at 9:00 AM every weekday
2. **Response Capture**: Monitors target channel for team member responses
3. **AI Analysis**: Sends responses to OpenAI for intelligent summarization
4. **Report Delivery**: Sends AI-generated report to team leader via DM

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Slack API     │◄──►│   Node.js    │◄──►│   OpenAI API    │
│   (Messages)    │    │   Bot App    │    │   (AI Reports)  │
└─────────────────┘    └──────────────┘    └─────────────────┘
        ▲                       ▲                     ▲
        │               ┌───────────────┐             │
        └───────────────│   Scheduling  │─────────────┘
                        │   (setTimeout) │
                        └───────────────┘
```

## File Structure

```
├── src/
│   └── app.ts          # Main bot application
├── .env                # Environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── README.md           # This file
└── prompts.md          # AI prompts documentation
```

## Troubleshooting

### Bot not responding
- Check Slack bot token and permissions
- Verify channel ID is correct
- Ensure bot is invited to the target channel

### AI reports not working
- Verify OpenAI API key is valid
- Check OpenAI account has sufficient credits
- Review console logs for API errors

### Questions not posting automatically
- Confirm bot process is running continuously
- Check timezone configuration
- Verify scheduling logs in console

## License

ISC