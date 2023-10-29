import { SpeechProcessor } from "./speech-processor.js";

/**
 * Speech Moderator for handling appropriate action for toxic speech.
 */
export class SpeechModerator {
  speechProcessor = new SpeechProcessor();
  constructor(logger) {
    this.logger = logger;
    this.receivedWarningSet = new Set();
  }

  startMonitoring() {
    return this.speechProcessor.initialize();
  }

  async processMessage(message) {
    try {
      if (await this.speechProcessor.isDangerousComment(message.content)) {
        const userId = message.author.id;
        if (this.receivedWarningSet.has(userId)) {
          const guild = message.guild;
          if (guild && guild.available) {
            const member = await guild.members.fetch(userId);
            if (member && member.kickable) {
              guild.members.kick(userId, "Toxic speech will not be tolerated.");
            }
          }
        } else {
          message.reply(
            "This is your only warning, this type of speech will not be tolerated."
          );
          this.receivedWarningSet.add(userId);
        }
      }
    } catch (e) {
      this.logger.logError(e);
    }
  }
}
