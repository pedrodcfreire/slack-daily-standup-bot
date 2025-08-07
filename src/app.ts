import { App } from '@slack/bolt';
import * as dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  port: 3000
});

let dailyResponses: any[] = [];

// Schedule every minute for testing
function scheduleDaily() {
  const interval = 60000; // 1 minute = 60,000 milliseconds
  
  setInterval(async () => {
    console.log('⏰ Every minute - posting daily questions...');
    dailyResponses = []; // Reset responses
    await postDailyQuestions(process.env.CHANNEL_ID || '');
  }, interval);
  
  console.log('📅 Questions will post every minute for testing');
}

async function generateAIReport(responses: any[]): Promise<string> {
  try {
    const responsesText = responses.map(r => `${r.user}: ${r.message}`).join('\n');
    
    const prompt = `You are a team lead assistant. Analyze these daily standup responses and create a concise, actionable report.

Team Responses:
${responsesText}

Please provide:
1. Brief progress summary
2. Today's focus areas
3. Blockers that need attention
4. Any recommendations for the team lead

Keep it professional but friendly, and highlight urgent items.`;

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

async function postDailyQuestions(channelId: string) {
  try {
    await app.client.chat.postMessage({
      channel: channelId,
      text: "🌅 Good morning! Time for our daily standup!",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Daily Standup Questions:*\n\n1️⃣ What did you work on yesterday?\n2️⃣ What will you work on today?\n3️⃣ Any blockers or impediments?"
          }
        }
      ]
    });
    console.log('✅ Daily questions posted successfully!');
  } catch (error) {
    console.error('❌ Error posting questions:', error);
  }
}

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

app.message(async ({ message, say }) => {
  try {
    if ('channel' in message && 'user' in message && 'text' in message) {
      if (message.channel === process.env.CHANNEL_ID) {
        console.log('📝 New response received!');
        console.log(`Message: ${message.text}`);
        
        const userInfo = await app.client.users.info({ user: message.user });
        const userName = userInfo.user?.real_name || 'Team Member';
        
        dailyResponses.push({
          user: userName,
          message: message.text,
          timestamp: new Date()
        });
        
        // Generate AI report instead of basic concatenation
        const aiReport = await generateAIReport(dailyResponses);
        await sendReportToLeader(aiReport, process.env.LEADER_USER_ID || '');
        await say(`✅ Thanks ${userName}! AI-powered report sent to team leader.`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
});

(async () => {
  try {
    await app.start();
    console.log('⚡️ Bot running on port 3000 with AI integration!');
    console.log('🌐 Ready for ngrok setup...');
    
    // Set up daily scheduling (simple version)
    scheduleDaily();
    
    // Post questions immediately for testing (remove this later)
    console.log('🧪 Posting test questions immediately...');
    await postDailyQuestions(process.env.CHANNEL_ID || '');
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();