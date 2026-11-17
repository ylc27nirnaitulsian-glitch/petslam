import crypto from 'crypto';
import { Request, Response } from 'express';

// Discord interaction types
const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5,
};

// Discord callback response types
const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
};

/**
 * Verify Ed25519 signature from Discord HTTP interaction webhook.
 */
export function verifyDiscordSignature(
  rawBody: Buffer | string | undefined,
  signature: string | undefined,
  timestamp: string | undefined,
  publicKeyHex: string
): boolean {
  if (!rawBody || !signature || !timestamp || !publicKeyHex) {
    return false;
  }

  try {
    const derPrefix = Buffer.from('302a300506032b6570032100', 'hex');
    const pubKey = crypto.createPublicKey({
      key: Buffer.concat([derPrefix, Buffer.from(publicKeyHex, 'hex')]),
      format: 'der',
      type: 'spki',
    });

    const bodyBuf = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf-8') : rawBody;
    const msg = Buffer.concat([Buffer.from(timestamp, 'utf-8'), bodyBuf]);

    return crypto.verify(null, msg, pubKey, Buffer.from(signature, 'hex'));
  } catch (err) {
    console.error('[Discord Signature Verify Error]:', err);
    return false;
  }
}

const SAMPLE_PETS = [
  { name: 'Cyber Shiba', element: '⚡ Volt / Cyber', hp: 1250, atk: 94, def: 82, spd: 110, ability: 'Overclock Blitz' },
  { name: 'Magma Bulldog', element: '🔥 Inferno', hp: 1420, atk: 108, def: 98, spd: 65, ability: 'Molten Bark' },
  { name: 'Glacial Kitsune', element: '❄️ Permafrost', hp: 1180, atk: 102, def: 78, spd: 118, ability: 'Blizzard Veil' },
  { name: 'Terra Mastiff', element: '🌱 Bio-Sanctuary', hp: 1550, atk: 88, def: 112, spd: 70, ability: 'Granite Guard' },
  { name: 'Quantum Axolotl', element: '🌌 Astral Void', hp: 1100, atk: 115, def: 75, spd: 124, ability: 'Phase Shift' },
];

/**
 * Handles incoming Discord HTTP interactions.
 */
export async function handleDiscordInteraction(req: Request, res: Response) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY || '';

  const signature = req.headers['x-signature-ed25519'] as string | undefined;
  const timestamp = req.headers['x-signature-timestamp'] as string | undefined;
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);

  // 1. Cryptographic Security Check
  if (!publicKey || !verifyDiscordSignature(rawBody, signature, timestamp, publicKey)) {
    return res.status(401).send('Invalid request signature');
  }

  const interaction = req.body;

  // 2. Discord PING verification (Discord Developer Portal uses this to validate the endpoint)
  if (interaction.type === InteractionType.PING) {
    return res.json({ type: InteractionResponseType.PONG });
  }

  // 3. Slash Command Handler (APPLICATION_COMMAND)
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = interaction.data;
    const callerUser = interaction.member?.user || interaction.user;
    const callerName = callerUser?.global_name || callerUser?.username || 'Trainer';

    // Command: /ping
    if (name === 'ping') {
      return res.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `🏓 **PONG!** PET SLAM Arena netcode is **Active** (20-tick authoritative server online).\n🌐 **Web:** https://www.petslam.app`,
        },
      });
    }

    // Command: /play
    if (name === 'play') {
      return res.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: '🐾 Step into the PET SLAM Arena!',
              description: `Hey **${callerName}**, ready to test your pet's combat potential? Play directly in Discord or in your browser.`,
              color: 0x6366f1, // Indigo
              fields: [
                { name: '🎮 Web App', value: '[Open PET SLAM](https://www.petslam.app)', inline: true },
                { name: '⚡ Combat', value: '60 FPS Physics & AI Vision', inline: true },
                { name: '🏆 Genesis Cup', value: 'Competitive Ranked Season 1', inline: true },
              ],
              footer: { text: 'PET SLAM: The AI Pet Esports Simulator' },
            },
          ],
          components: [
            {
              type: 1, // ACTION_ROW
              components: [
                {
                  type: 2, // BUTTON
                  style: 5, // LINK
                  label: 'Play PET SLAM Now',
                  url: 'https://www.petslam.app',
                },
              ],
            },
          ],
        },
      });
    }

    // Command: /pet
    if (name === 'pet') {
      const requestedName = options?.find((o: any) => o.name === 'name')?.value;
      const pet = requestedName
        ? SAMPLE_PETS.find((p) => p.name.toLowerCase().includes(requestedName.toLowerCase())) || {
            name: requestedName,
            element: '✨ Neural Mystic',
            hp: 1280,
            atk: 96,
            def: 88,
            spd: 104,
            ability: 'Gemini Vision Synthesis',
          }
        : SAMPLE_PETS[Math.floor(Math.random() * SAMPLE_PETS.length)];

      return res.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: `🐾 Fighter Dossier: ${pet.name}`,
              color: 0xf59e0b, // Amber
              fields: [
                { name: 'Affinity', value: pet.element, inline: true },
                { name: 'Signature Perk', value: pet.ability, inline: true },
                { name: 'Combat Rating', value: '⭐ Tier S (Gen-1)', inline: true },
                { name: 'Health (HP)', value: `${pet.hp}`, inline: true },
                { name: 'Attack (ATK)', value: `${pet.atk}`, inline: true },
                { name: 'Defense (DEF)', value: `${pet.def}`, inline: true },
                { name: 'Agility (SPD)', value: `${pet.spd}`, inline: true },
              ],
              footer: { text: 'Train and breed your companion at petslam.app' },
            },
          ],
        },
      });
    }

    // Command: /battle
    if (name === 'battle') {
      const challengerId = options?.find((o: any) => o.name === 'challenger')?.value;
      const biome = options?.find((o: any) => o.name === 'biome')?.value || 'Cyber Neon Stadium';
      const pet1 = SAMPLE_PETS[Math.floor(Math.random() * SAMPLE_PETS.length)];
      let pet2 = SAMPLE_PETS[Math.floor(Math.random() * SAMPLE_PETS.length)];
      while (pet2.name === pet1.name) {
        pet2 = SAMPLE_PETS[Math.floor(Math.random() * SAMPLE_PETS.length)];
      }

      const p1Score = pet1.atk * 1.2 + pet1.spd * 0.8 + Math.random() * 20;
      const p2Score = pet2.atk * 1.2 + pet2.spd * 0.8 + Math.random() * 20;
      const winner = p1Score >= p2Score ? pet1 : pet2;
      const rivalText = challengerId ? `<@${challengerId}>` : 'Wild AI Boss';

      return res.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: `⚔️ Genesis Arena Clash — ${biome}`,
              description: `**${callerName}** [${pet1.name}] VS **${rivalText}** [${pet2.name}]`,
              color: 0xef4444, // Red
              fields: [
                { name: `Round 1`, value: `${pet1.name} triggers **${pet1.ability}**!`, inline: false },
                { name: `Round 2`, value: `${pet2.name} counters with **${pet2.ability}**!`, inline: false },
                { name: `🏆 Victorious Fighter`, value: `**${winner.name}** claims the match (+25 Genesis ELO)!`, inline: false },
              ],
              footer: { text: 'Play full real-time 60fps battles at petslam.app' },
            },
          ],
        },
      });
    }

    // Command: /leaderboard
    if (name === 'leaderboard') {
      return res.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: '🏆 PET SLAM Genesis Cup: Global Top 5',
              color: 0x10b981, // Emerald
              description: 'Real-time competitive ladder standings:',
              fields: [
                { name: '🥇 1. Satoshi.eth', value: '2,480 ELO | Cyber Shiba | 94% W/L', inline: false },
                { name: '🥈 2. CyberHound_X', value: '2,340 ELO | Magma Bulldog | 88% W/L', inline: false },
                { name: '🥉 3. KitsuneRider', value: '2,290 ELO | Glacial Kitsune | 85% W/L', inline: false },
                { name: '4. VoidWalker', value: '2,180 ELO | Quantum Axolotl | 81% W/L', inline: false },
                { name: '5. TerraTank', value: '2,110 ELO | Terra Mastiff | 79% W/L', inline: false },
              ],
              footer: { text: 'Climb the ladder: https://www.petslam.app' },
            },
          ],
        },
      });
    }

    // Command: /radar
    if (name === 'radar') {
      return res.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: '🛰️ Real-World GPS Pet Rescue Radar',
              description: 'Radar sweep complete! Anomaly signatures detected nearby:',
              color: 0x06b6d4, // Cyan
              fields: [
                { name: '📍 Sector A-4', value: 'Rare Cyber Shiba pup spotted (+300m)', inline: true },
                { name: '🧬 Gene Rarity', value: 'Prismatic (0.4% spawn rate)', inline: true },
                { name: '🕒 Time Remaining', value: '14 minutes before despawn', inline: true },
              ],
              footer: { text: 'Open radar map on mobile: https://www.petslam.app' },
            },
          ],
        },
      });
    }
  }

  // Fallback for unknown interactions
  return res.status(400).json({ error: 'Unknown interaction type' });
}
