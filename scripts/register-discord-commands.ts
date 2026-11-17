import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1571901968270499870';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('[Error] DISCORD_BOT_TOKEN is missing in .env');
  process.exit(1);
}

const customCommands = [
  {
    name: 'ping',
    description: 'Check PET SLAM bot connectivity and arena latency',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'play',
    description: 'Launch PET SLAM directly in Discord Activity or web browser',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'battle',
    description: 'Simulate an instant tactical pet battle in the arena',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
      {
        name: 'challenger',
        description: 'Tag an opponent to duel in the Genesis Arena',
        type: 6, // USER type
        required: false,
      },
      {
        name: 'biome',
        description: 'Choose arena battleground environment',
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'Cyber Neon Stadium (Urban)', value: 'neon_stadium' },
          { name: 'Volcanic Magma Chamber (Fire)', value: 'volcanic' },
          { name: 'Glacial Permafrost Spire (Ice)', value: 'glacial' },
          { name: 'Overgrown Biome Sanctuary (Nature)', value: 'sanctuary' },
        ],
      },
    ],
  },
  {
    name: 'pet',
    description: 'Inspect a pet fighter’s elemental affinity, genetics, and combat rating',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
      {
        name: 'name',
        description: 'Name or species of the pet fighter',
        type: 3, // STRING
        required: false,
      },
    ],
  },
  {
    name: 'leaderboard',
    description: 'View current Genesis Cup top rankings, win rates, and ELO',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  {
    name: 'radar',
    description: 'Scan real-world GPS radar for wild pet rescue anomalies',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
];

async function registerCommands() {
  console.log(`[Discord] Fetching existing commands for App ID: ${CLIENT_ID}...`);

  const existingRes = await fetch(`https://discord.com/api/v10/applications/${CLIENT_ID}/commands`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
  });

  const existing = existingRes.ok ? await existingRes.json() : [];
  // Preserve Discord Activity primary entry point commands (Type 4)
  const entryPointCommands = existing.filter((c: any) => c.type === 4);

  console.log(`[Discord] Preserving ${entryPointCommands.length} Discord Activity Entry Point command(s)...`);

  const allCommands = [...entryPointCommands, ...customCommands];

  console.log(`[Discord] Registering ${allCommands.length} total commands...`);

  const response = await fetch(`https://discord.com/api/v10/applications/${CLIENT_ID}/commands`, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(allCommands),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Discord API Error] Status ${response.status}: ${errorText}`);
    process.exit(1);
  }

  const registered = await response.json();
  console.log(`[Success] Successfully registered ${registered.length} Discord slash commands:`);
  for (const cmd of registered) {
    console.log(` - /${cmd.name} (Type ${cmd.type}): ${cmd.description} (ID: ${cmd.id})`);
  }
}

registerCommands().catch((err) => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
