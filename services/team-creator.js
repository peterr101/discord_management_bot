import { dirname } from "path";
import { fileURLToPath } from "url";
import { appendFile, unlink } from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "node:fs";

const TEAMS_ATTACHMENT_PATH =
  dirname(fileURLToPath(import.meta.url)) + "/../output/";

const SEPARATOR = "==================================================\n";

class InsufficientMembersError extends Error {}

/**
 * Generate a number of teams and write their output to a file.
 */
export class TeamCreator {
  constructor(logger) {
    this.logger = logger;
  }

  async sendTeamsAttachment(message, numTeams) {
    const guild = message.guild;
    if (guild && guild.available) {
      const members = await guild.members.fetch();
      const userNames = members.reduce((acc, member) => {
        if (!member.user.bot) {
          acc.push(member.user.username);
        }
        return acc;
      }, []);
      this.sendAttachment(message, numTeams, userNames);
    }
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  createTeams(num, names) {
    if (!(names && Array.isArray(names))) return;
    if (names.length < num) {
      throw new InsufficientMembersError(
        "not enough members to create the teams."
      );
    }
    const teams = Array.from({ length: num }, () => []);
    while (names.length) {
      let numTeams = 0;
      while (numTeams < num && names.length) {
        const index = this.getRandomInt(0, names.length - 1);
        teams[numTeams].push(names.splice(index, 1)[0]);
        numTeams++;
      }
    }
    return teams;
  }

  async sendAttachment(message, num, names) {
    let fileName;
    try {
      fileName = TEAMS_ATTACHMENT_PATH + uuidv4();
      console.log(fileName);
      const teams = this.createTeams(num, names);
      const writePromises = [];
      teams.forEach((team, i) => {
        const title = `Team ${i}:\n`;
        const names = team.join("\n");
        writePromises.push(
          appendFile(fileName, title + names + "\n" + SEPARATOR)
        );
      });
      await Promise.all(writePromises);
      await message.channel.send({
        files: [
          {
            attachment: fileName,
            name: "generated_teams.txt",
          },
        ],
      });
    } catch (e) {
      if (e instanceof InsufficientMembersError) {
        message.reply(
          `There are not enough members in the channel to create ${num} teams.`
        );
      } else {
        this.logger.logError("Failed to create attachment file.");
        message.reply("There was an unexpected error creating the teams.");
      }
    }
    if (existsSync(fileName)) {
      unlink(fileName);
    }
  }
}
