import { App } from '@slack/bolt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  port: 3000
});

let dailyResponses: any[] = [];

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
      text: "📊 Daily Standup Report",
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
    console.log('✅ Report sent to team leader!');
  } catch (error) {
    console.error('❌ Error sending report:', error);
  }
}

app.message(async ({ message, say }) => {
  try {
    if ('channel' in message && 'user' in message && 'text' in message) {
      if (message.channel === process.env.CHANNEL_ID) {
        console.log('📝 HTTP: New response received!');
        console.log(`Message: ${message.text}`);
        
        const userInfo = await app.client.users.info({ user: message.user });
        const userName = userInfo.user?.real_name || 'Team Member';
        
        dailyResponses.push({
          user: userName,
          message: message.text,
          timestamp: new Date()
        });
        
        const report = `📊 **Daily Standup Report**

**New Response from ${userName}:**
"${message.text}"

**All Responses:**
${dailyResponses.map((r, i) => `${i + 1}. **${r.user}**: ${r.message}`).join('\n')}

**Total:** ${dailyResponses.length} responses`;

        await sendReportToLeader(report, process.env.LEADER_USER_ID || '');
        await say(`✅ Thanks ${userName}! Response sent to team leader.`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
});

(async () => {
  try {
    await app.start();
    console.log('⚡️ HTTP Bot running on port 3000!');
    console.log('🌐 Ready for ngrok setup...');
    
    await postDailyQuestions(process.env.CHANNEL_ID || '');
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();