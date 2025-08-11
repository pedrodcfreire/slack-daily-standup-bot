# Slack Daily Standup Bot

AI-powered Slack bot that automates daily standup meetings and generates intelligent team reports.

## Features

- 🤖 **Automated Daily Questions**: Posts standup questions every day
- 🧠 **AI-Generated Reports**: Uses OpenAI to create intelligent summaries for team leaders
- ⏰ **Scheduled Operations**: Automatically runs daily without manual intervention
- 📊 **Real-time Processing**: Captures team responses and sends immediate reports
- 🔒 **Secure**: Environment-based configuration for sensitive tokens

## Prerequisites

- Node.js (v18 or higher)
- npm package manager
- Slack workspace with admin permissions
- OpenAI API account with credits

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
   Create a `.env` file in the project root with the configuration variables shown below.

## Configuration

Create a `.env` file with the following variables:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
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

2. **Enable Socket Mode:**
   - Go to "Socket Mode" → Toggle "Enable Socket Mode" ON
   - Click "Generate" to create App-Level Token
   - Add scope: `connections:write`
   - Copy token (starts with `xapp-`) to `SLACK_APP_TOKEN`

3. **Configure Bot Token:**
   - Go to "OAuth & Permissions"
   - Add these scopes: `chat:write`, `users:read`, `channels:history`
   - Install app to workspace
   - Copy "Bot User OAuth Token" to `SLACK_BOT_TOKEN`

4. **Get Signing Secret:**
   - Go to "Basic Information"
   - Copy "Signing Secret" to `SLACK_SIGNING_SECRET`

5. **Configure Event Subscriptions:**
   - Go to "Event Subscriptions" → Enable Events
   - Since using Socket Mode, no Request URL needed
   - Subscribe to: `message.channels`

6. **Get Channel and User IDs:**
   - Channel ID: Right-click channel → Copy Link → Extract ID from URL
   - User ID: Right-click team leader → "Copy member ID"

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

## How It Works

1. **Daily Scheduling**: Bot automatically posts standup questions every 24 hours
2. **Response Capture**: Monitors target channel for team member responses
3. **AI Analysis**: Sends responses to OpenAI for intelligent summarization
4. **Report Delivery**: Sends AI-generated report to team leader via DM

## Architecture

The bot uses Socket Mode for real-time communication with Slack, eliminating the need for webhooks or public URLs.

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Slack API     │◄──►│   Node.js    │◄──►│   OpenAI API    │
│   (Socket Mode) │    │   Bot App    │    │   (AI Reports)  │
└─────────────────┘    └──────────────┘    └─────────────────┘
        ▲                       ▲                     
        │               ┌───────────────┐             
        └───────────────│   Scheduling  │             
                        │  (setInterval)│             
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

## AI Report Format

The bot generates structured reports with three main sections:

- **Today's Focus Areas**: What the team is working on today
- **Yesterday's Achievements**: Completed work and progress made
- **Blockers & Recommendations**: Issues requiring leadership attention and suggested actions

## Troubleshooting

### Bot not responding
- Check all environment variables are set correctly
- Verify bot is invited to the target channel: `/invite @your-bot-name`
- Ensure Socket Mode is enabled with correct App Token
- Confirm `message.channels` event is subscribed

### AI reports not working
- Verify OpenAI API key is valid and has credits
- Check console logs for API errors

### Questions not posting automatically
- Confirm bot process is running continuously
- Check console for scheduling confirmation logs