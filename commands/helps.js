// commands/help.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription(`Detailed guide for using every command in the job bot
         
        `),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📘 Job Bot Help Menu')
      .setDescription(`Below is a detailed guide on how to use each command, including what each input means.`)
      .setColor(0x1D9BF0)
      .addFields(
        { name: '\u200B', value: '\u200B' },
        {
          name: '📝 /postjob',
          value: `**Purpose:** Post a new job listing in the current channel.
**Parameters:**
- \`position\` *(required)*: Job title (e.g., "Software Engineer").
- \`company\` *(required)*: Company name (e.g., "Google").
- \`employmentType\`: Type of job (Full-time, Part-time, Internship, etc.).
- \`location\`: Where the job is based or remote.
- \`link\`: External URL to apply.
- \`jobID\`: Optional identifier for the job.
- \`numberApplied\`: Number of applicants so far.
- \`term\`: Season or time period (e.g., Fall 2025).
- \`duration\`: Length of the job (e.g., "4 months").
- \`salary\`: Salary or hourly rate.
- **Job Description**: Entered in a modal popup when the command runs.
**Example:**
\`/postjob position: SDE Intern company: Amazon location: Remote employmentType: Internship link: https://...\`\u200B`
        },
        { name: '\u200B', value: '\u200B' },
        {
          name: '📈 /leaderboard',
          value: `**Purpose:** See the top contributors who’ve posted the most jobs.
**Parameter:**
- \`range\`: (Optional) Time range for stats.
  - \`alltime\`: Default. Counts all job posts ever.
  - \`lastweek\`: Only shows posts from the last 7 days.
  - \`today\`: Shows job posts from today only.
**Example:**
\`/leaderboard range: lastweek\`  
This displays a ranked list of the top 10 posters with stats like total jobs, reactions, averages, etc.\u200B`
        },
        { name: '\u200B', value: '\u200B' },
        {
          name: '📊 /stats',
          value: `**Purpose:** View your personal job posting stats.
**Outputs:**
- Total number of job posts.
- Total ✅ reactions (indicating applicants).
- Average posts per day/week.
- Average reactions per post.
- Longest posting streak.
- Date of your last post.
**Example:**
\`/stats\`  
Returns a personalized report on your contributions.\u200B`
        },
        { name: '\u200B', value: '\u200B' },
        {
          name: '🏆 /rivals',
          value: `**Purpose:** See who’s ranked right above and below you on the leaderboard.
**Logic:**
- Compares your post count to others in the channel.
- Shows your rank, who's ahead, and who's catching up.
**Example:**
\`/rivals\`  
This helps you stay competitive by highlighting your nearest rivals.\u200B`
        },
        { name: '\u200B', value: '\u200B' }
      )
      .setFooter({ text: 'Stay competitive. Post jobs. Climb the leaderboard. 🧠' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};