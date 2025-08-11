import { App } from '@slack/bolt';
import * as dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables from .env file
dotenv.config();

/**
 * Interface for standup responses
 */
interface StandupResponse {
  user: string;
  message: string;
  timestamp: Date;
}

/**
 * Initialize Slack Bolt app with Socket Mode
 */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: 3000
  logLevel: 'info' // This reduces debug warnings
});

/**
 * Array to store daily standup responses from team members
 */
let dailyResponses: StandupResponse[] = [];

/**
 * Schedules daily standup questions to be posted every 24 hours
 * Uses setInterval to automatically post questions at regular intervals
 */
function scheduleDaily() {
  const interval = 1000 * 60 * 60 * 24; // 24 hours
  
  setInterval(async () => {
    console.log('⏰ Daily - posting questions...');
    dailyResponses = [];
    await postDailyQuestions(process.env.CHANNEL_ID || '');
  }, interval);
  
  console.log('📅 Questions will post every 24 hours');
}

/**
 * Generates an AI-powered daily standup report from team responses
 * @param responses - Array of team member responses containing user and message data
 * @returns Promise<string> - Formatted AI report with date, focus areas, achievements, and blockers
 */
async function generateAIReport(responses: StandupResponse[]): Promise<string> {
  try {
    const responsesText = responses.map(r => `${r.user}: ${r.message}`).join('\n');
    
    const prompt = `You are a team lead assistant. Create a very brief report analyzing the team responses.

Team Responses:
${responsesText}

Format the report exactly like this:

**📅 Daily Standup Report - ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**

**1. Today's Focus Areas**
[Brief 1-line summary of what the team is working on today]

**2. Yesterday's Achievements**  
[Brief 1-line summary of what was completed yesterday]

**3. Blockers & Recommendations**
[Brief 1-2 line summary of any issues and recommendations]

Do NOT include the exact team responses. Only provide your analysis. Keep each section to maximum 2 lines. Use **bold** formatting for headers.`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    return `📊 **Daily Standup Report** (Fallback)

**Team Responses:**
${responses.map((r, i) => `${i + 1}. **${r.user}**: ${r.message}`).join('\n')}

**Total:** ${responses.length} responses
*Note: AI analysis temporarily unavailable*`;
  }
}

/**
 * Posts daily standup questions to the specified Slack channel
 * @param channelId - Slack channel ID where the questions should be posted
 */
async function postDailyQuestions(channelId: string) {
  try {
    await app.client.chat.postMessage({
      channel: channelId,
      text: "🌅 Good morning! Daily standup questions",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "🌅 Good morning! Hope you're having a great day. Time for our daily standup!\n\n*Daily Standup Questions:*\n\n1️⃣ What did you work on yesterday?\n2️⃣ What will you work on today?\n3️⃣ Any blockers?"
          }
        }
      ]
    });
    console.log('✅ Daily questions posted successfully!');
  } catch (error) {
    console.error('❌ Error posting questions:', error);
  }
}

/**
 * Sends the AI-generated report to the team leader via Slack DM
 * @param report - The formatted AI report content to send
 * @param leaderUserId - Slack user ID of the team leader who should receive the report
 */
async function sendReportToLeader(report: string, leaderUserId: string) {
  try {
    await app.client.chat.postMessage({
      channel: leaderUserId,
      text: "📊 AI-Generated Daily Standup Report",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: report
          }
        }
      ]
    });
    console.log('✅ AI-generated report sent to team leader!');
  } catch (error) {
    console.error('❌ Error sending report:', error);
  }
}

/**
 * Event handler for processing team member messages in the configured channel
 * Captures responses, generates AI reports, and sends them to the team leader
 */
app.message(async ({ message, say, client }) => {
  try {
    if ('channel' in message && 'user' in message && 'text' in message) {
      if (message.channel === process.env.CHANNEL_ID) {
        // Ignore bot messages
        if (message.subtype === 'bot_message' || ('bot_id' in message && message.bot_id)) {
          return;
        }

        console.log('📝 New response received!');
        console.log(`Message: ${message.text}`);
        
        const userInfo = await client.users.info({ user: message.user });
        const userName = userInfo.user?.real_name || 'Team Member';
        
        dailyResponses.push({
          user: userName,
          message: message.text,
          timestamp: new Date()
        });
        
        const aiReport = await generateAIReport(dailyResponses);
        await sendReportToLeader(aiReport, process.env.LEADER_USER_ID || '');
        await say(`✅ Thanks ${userName}! AI-powered report sent to team leader.`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
});

/**
 * Initialize and start the Slack bot application
 * Sets up daily scheduling and posts initial test questions
 */
(async () => {
  try {
    await app.start();
    console.log('⚡️ Bot running with Socket Mode and AI integration!');
    console.log('🌐 Ready for deployment...');
    
    scheduleDaily();
    
    console.log('🧪 Posting test questions immediately...');
    await postDailyQuestions(process.env.CHANNEL_ID || '');
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();