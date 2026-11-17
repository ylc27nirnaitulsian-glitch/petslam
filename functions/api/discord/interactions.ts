/**
 * Cloudflare Pages Function: /api/discord/interactions
 * Handles Discord HTTP Interactions (Slash commands & PING verification).
 */

interface Env {
  DISCORD_PUBLIC_KEY?: string;
  DISCORD_CLIENT_ID?: string;
  DISCORD_BOT_TOKEN?: string;
}

interface EventContext {
  request: Request;
  env: Env;
}

const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
};

const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
};

// Fallback public key from current Discord App
const DEFAULT_PUBLIC_KEY = 'd4f049d3f79b1e202430d6c1eb02c265d9a609ec4c53b93e43876eb2944c4f8b';

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function verifyDiscordSignature(
  rawBody: string,
  signatureHex: string | null,
  timestamp: string | null,
  publicKeyHex: string
): Promise<boolean> {
  if (!rawBody || !signatureHex || !timestamp || !publicKeyHex) {
    return false;
  }

  try {
    const keyBytes = hexToUint8Array(publicKeyHex);
    const sigBytes = hexToUint8Array(signatureHex);

    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(timestamp + rawBody);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'Ed25519' },
      false,
      ['verify']
    );

    return await crypto.subtle.verify(
      { name: 'Ed25519' },
      cryptoKey,
      sigBytes,
      messageBytes
    );
  } catch (err) {
    console.error('[Discord WebCrypto Verify Error]:', err);
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

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Signature-Ed25519, X-Signature-Timestamp',
    },
  });
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  const { request, env } = context;
  const publicKey = env.DISCORD_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;

  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const rawBody = await request.text();

  // 1. Ed25519 Security Verification
  const isValid = await verifyDiscordSignature(rawBody, signature, timestamp, publicKey);
  if (!isValid) {
    return new Response('Invalid request signature', { status: 401 });
  }

  let interaction: any;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // 2. Discord PING Verification (Critical for Discord Developer Portal setup)
  if (interaction.type === InteractionType.PING) {
    return new Response(JSON.stringify({ type: InteractionResponseType.PONG }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  }

  // 3. Application Command Handler
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = interaction.data;
    const callerUser = interaction.member?.user || interaction.user;
    const callerName = callerUser?.global_name || callerUser?.username || 'Trainer';

    // /ping
    if (name === 'ping') {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `🏓 **PONG!** PET SLAM Cloudflare Edge node is **Active**.\n🌐 **Web:** https://www.petslam.app`,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // /play
    if (name === 'play') {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: '🐾 Step into the PET SLAM Arena!',
                description: `Hey **${callerName}**, ready to test your pet's combat potential? Play directly in Discord or on the web.`,
                color: 0x6366f1,
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
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 5,
                    label: 'Play PET SLAM Now',
                    url: 'https://www.petslam.app',
                  },
                ],
              },
            ],
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // /pet
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

      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: `🐾 Fighter Dossier: ${pet.name}`,
                color: 0xf59e0b,
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
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // /battle
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

      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: `⚔️ Genesis Arena Clash — ${biome}`,
                description: `**${callerName}** [${pet1.name}] VS **${rivalText}** [${pet2.name}]`,
                color: 0xef4444,
                fields: [
                  { name: `Round 1`, value: `${pet1.name} triggers **${pet1.ability}**!`, inline: false },
                  { name: `Round 2`, value: `${pet2.name} counters with **${pet2.ability}**!`, inline: false },
                  { name: `🏆 Victorious Fighter`, value: `**${winner.name}** claims the match (+25 Genesis ELO)!`, inline: false },
                ],
                footer: { text: 'Play full real-time 60fps battles at petslam.app' },
              },
            ],
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // /leaderboard
    if (name === 'leaderboard') {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: '🏆 PET SLAM Genesis Cup: Global Top 5',
                color: 0x10b981,
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
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // /radar
    if (name === 'radar') {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: '🛰️ Real-World GPS Pet Rescue Radar',
                description: 'Radar sweep complete! Anomaly signatures detected nearby:',
                color: 0x06b6d4,
                fields: [
                  { name: '📍 Sector A-4', value: 'Rare Cyber Shiba pup spotted (+300m)', inline: true },
                  { name: '🧬 Gene Rarity', value: 'Prismatic (0.4% spawn rate)', inline: true },
                  { name: '🕒 Time Remaining', value: '14 minutes before despawn', inline: true },
                ],
                footer: { text: 'Open radar map on mobile: https://www.petslam.app' },
              },
            ],
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(JSON.stringify({ error: 'Unknown interaction type' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 400,
  });
}
