import "dotenv/config";
import { SpeechModerator } from "./services/speech-moderator.js";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { Logger } from "./services/logger.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
client.login(process.env.DISCORD_KEY);
const logger = new Logger();
await logger.initialize();
const speechModerator = new SpeechModerator(logger);

client.once(Events.ClientReady, async (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  await speechModerator.startMonitoring();
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  await speechModerator.processMessage(message);
});
