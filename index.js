const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  REST,
  Routes
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  {
    name: "panel",
    description: "Ticket paneli gönderir"
  }
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.once("ready", async () => {
  console.log(`${client.user.tag} aktif`);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );
});

client.on("interactionCreate", async interaction => {

  // Slash command
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket Sistemi")
        .setDescription("Aşağıdan destek türünü seç.");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("destek")
          .setLabel("Destek")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("sikayet")
          .setLabel("Şikayet")
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId("yetkili")
          .setLabel("Yetkili Başvuru")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("satin")
          .setLabel("Satın Alım")
          .setStyle(ButtonStyle.Secondary)
      );

      interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // Buttons
  if (interaction.isButton()) {

    // Ticket açma
    if (
      interaction.customId === "destek" ||
      interaction.customId === "sikayet" ||
      interaction.customId === "yetkili" ||
      interaction.customId === "satin"
    ) {

      const kanal = await interaction.guild.channels.create({
        name: `${interaction.customId}-${interaction.user.username}`,
        type: ChannelType.GuildText,

        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },

          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages
            ]
          }
        ]
      });

      const kapat = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("kapat")
          .setLabel("Ticket Kapat")
          .setStyle(ButtonStyle.Danger)
      );

      kanal.send({
        content: `Hoş geldin ${interaction.user}`,
        components: [kapat]
      });

      interaction.reply({
        content: `Ticket açıldı: ${kanal}`,
        ephemeral: true
      });
    }

    // Ticket kapatma
    if (interaction.customId === "kapat") {

      await interaction.reply({
        content: "Ticket kapatılıyor...",
        ephemeral: true
      });

      setTimeout(() => {
        interaction.channel.delete();
      }, 3000);
    }
  }
});

client.login(process.env.TOKEN);