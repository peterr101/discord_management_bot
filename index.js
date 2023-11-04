import "dotenv/config";
import { SpeechModerator } from "./services/speech-moderator.js";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { Logger } from "./services/logger.js";
import { TeamCreator } from "./services/team-creator.js";

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
const teamCreator = new TeamCreator(logger);

client.once(Events.ClientReady, async (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  await speechModerator.startMonitoring();
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.content && message.content.startsWith("!")) {
    const commands = message.content.substring(1).split(" ");
    switch (commands[0]) {
      case "make_teams":
        const numTeams = parseInt(commands[1]);
        if (isNaN(numTeams)) {
          message.reply("Please provide the number of teams to create.");
        } else {
          teamCreator.sendTeamsAttachment(message, commands[1]);
        }
        break;
      default:
        message.reply("The only supported commands are make_teams.");
    }
  } else {
    await speechModerator.processMessage(message);
  }
});
