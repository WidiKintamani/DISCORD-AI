require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://yourdomain.com", // bebas
    "X-Title": "DiscordAIBot"
  }
});

client.once('ready', () => {
  console.log(`🤖 Bot siap sebagai ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const isMentioned = message.mentions.has(client.user);
  const isReplyToBot = message.reference?.messageId
    ? (await message.channel.messages.fetch(message.reference.messageId)).author.id === client.user.id
    : false;

  if (isMentioned || isReplyToBot) {
    const prompt = message.content.replace(/<@!?(\d+)>/, '').trim();

    if (!prompt) {
      return message.reply("Hai! Ketik sesuatu setelah mention atau reply, ya 🤖");
    }

    try {
      const response = await openai.chat.completions.create({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: "Kamu adalah AI pintar di Discord." },
          { role: "user", content: prompt }
        ]
      });

      const replyText = response.choices[0].message.content;
      message.reply(replyText);
    } catch (err) {
      console.error("❌ Error dari OpenRouter:", err);
      message.reply("Terjadi kesalahan. Mungkin API gratis kamu limit atau sedang gangguan.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
