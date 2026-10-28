import {
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { isBotOwner } from '../../config/bot.js';

const MAX_LISTED_GUILDS = 25;

function getGuildOption(interaction) {
    return interaction.options.getString('server', true);
}

function findGuild(client, guildId) {
    return client.guilds.cache.get(guildId) || null;
}

function getInviteChannel(guild) {
    const botMember = guild.members.me;
    if (!botMember) {
        return null;
    }

    const channels = guild.channels.cache.filter((channel) => (
        channel.type === ChannelType.GuildText &&
        channel.permissionsFor(botMember)?.has(PermissionFlagsBits.CreateInstantInvite)
    ));

    return channels.find((channel) => channel.id === guild.systemChannelId) || channels.first();
}

async function createGuildInvite(guild) {
    const channel = getInviteChannel(guild);
    if (!channel) {
        return null;
    }

    try {
        const invite = await channel.createInvite({
            maxAge: 0,
            maxUses: 0,
            unique: false,
            reason: 'Owner requested a server management invite',
        });
        return invite.url;
    } catch {
        return null;
    }
}

function getGuildFromOption(interaction, client) {
    return findGuild(client, getGuildOption(interaction));
}

function buildGuildChoices(client) {
    return [...client.guilds.cache.values()]
        .sort((left, right) => left.name.localeCompare(right.name))
        .slice(0, 25)
        .map((guild) => ({ name: guild.name.slice(0, 100), value: guild.id }));
}

export default {
    category: 'Core',
    data: new SlashCommandBuilder()
        .setName('servers')
        .setDescription('View and manage the servers where the bot is installed')
        .setDMPermission(true)
        .addSubcommand((subcommand) => subcommand
            .setName('list')
            .setDescription('List the servers and generate invite links'))
        .addSubcommand((subcommand) => subcommand
            .setName('info')
            .setDescription('Show details and an invite link for one server')
            .addStringOption((option) => option
                .setName('server')
                .setDescription('The server to inspect')
                .setRequired(true)
                .setAutocomplete(true)))
        .addSubcommand((subcommand) => subcommand
            .setName('invite')
            .setDescription('Generate a permanent invite link for one server')
            .addStringOption((option) => option
                .setName('server')
                .setDescription('The server to invite someone to')
                .setRequired(true)
                .setAutocomplete(true)))
        .addSubcommand((subcommand) => subcommand
            .setName('leave')
            .setDescription('Make the bot leave one server')
            .addStringOption((option) => option
                .setName('server')
                .setDescription('The server to leave')
                .setRequired(true)
                .setAutocomplete(true))
            .addBooleanOption((option) => option
                .setName('confirm')
                .setDescription('Confirm that the bot should leave this server')
                .setRequired(true))),

    async autocomplete(interaction, client) {
        if (!isBotOwner(interaction.user?.id)) {
            await interaction.respond([]);
            return;
        }

        const focused = interaction.options.getFocused().toLowerCase();
        const choices = buildGuildChoices(client)
            .filter((choice) => choice.name.toLowerCase().includes(focused));
        await interaction.respond(choices.slice(0, 25));
    },

    async execute(interaction, _guildConfig, client) {
        if (!isBotOwner(interaction.user?.id)) {
            await interaction.reply({
                embeds: [createEmbed({
                    title: 'Owner only',
                    description: 'Only a configured bot owner can manage the bot\'s servers.',
                    color: 'error',
                })],
                ephemeral: true,
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        await InteractionHelper.safeDefer(interaction, { flags: MessageFlags.Ephemeral });

        if (subcommand === 'list') {
            const guilds = [...client.guilds.cache.values()]
                .sort((left, right) => left.name.localeCompare(right.name));
            const listedGuilds = guilds.slice(0, MAX_LISTED_GUILDS);
            const lines = await Promise.all(listedGuilds.map(async (guild) => {
                const inviteUrl = await createGuildInvite(guild);
                return `**${guild.name}** (${guild.id}) - ${inviteUrl || 'Invite unavailable'}`;
            }));

            const suffix = guilds.length > MAX_LISTED_GUILDS
                ? `\nOnly the first ${MAX_LISTED_GUILDS} servers are shown.`
                : '';
            const embed = createEmbed({
                title: `Bot servers (${guilds.length})`,
                description: `${lines.join('\n')}\n${suffix}`.trim() || 'The bot is not in any servers.',
                color: 'primary',
            });
            await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
            return;
        }

        const guild = getGuildFromOption(interaction, client);
        if (!guild) {
            await InteractionHelper.safeEditReply(interaction, {
                embeds: [createEmbed({ title: 'Server not found', description: 'That server is no longer available to the bot.', color: 'error' })],
            });
            return;
        }

        if (subcommand === 'leave') {
            if (!interaction.options.getBoolean('confirm', true)) {
                await InteractionHelper.safeEditReply(interaction, {
                    embeds: [createEmbed({ title: 'Confirmation required', description: 'Set `confirm` to `true` to make the bot leave this server.', color: 'warning' })],
                });
                return;
            }

            await guild.leave();
            await InteractionHelper.safeEditReply(interaction, {
                embeds: [createEmbed({ title: 'Left server', description: `The bot left **${guild.name}**.`, color: 'success' })],
            });
            return;
        }

        const inviteUrl = await createGuildInvite(guild);
        const description = inviteUrl
            ? `[Join ${guild.name}](${inviteUrl})`
            : 'Invite unavailable. The bot needs a text channel where it can create invites.';
        const embed = createEmbed({
            title: guild.name,
            description,
            color: inviteUrl ? 'success' : 'warning',
        }).addFields(
            { name: 'Server ID', value: guild.id, inline: true },
            { name: 'Members', value: `${guild.memberCount ?? 'Unknown'}`, inline: true },
            { name: 'Owner ID', value: guild.ownerId || 'Unknown', inline: true },
        );
        await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
    },
};