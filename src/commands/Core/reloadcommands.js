import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { isBotOwner } from '../../config/bot.js';
import { loadCommands } from '../../handlers/loaders/commandLoader.js';

export default {
    data: new SlashCommandBuilder()
        .setName('reloadcommands')
        .setDescription('Reload all bot commands and sync slash commands to Discord'),

    async execute(interaction, _guildConfig, client) {
        if (!isBotOwner(interaction.user?.id)) {
            await interaction.reply({
                embeds: [createEmbed({
                    title: 'Owner only',
                    description: 'Only a configured bot owner can reload the command list.',
                    color: 'error',
                })],
                ephemeral: true,
            });
            return;
        }

        await InteractionHelper.safeDefer(interaction, { flags: MessageFlags.Ephemeral });

        try {
            await loadCommands(client);
            if (typeof client.registerCommands === 'function') {
                await client.registerCommands();
            }

            await InteractionHelper.safeEditReply(interaction, {
                embeds: [createEmbed({
                    title: 'Commands reloaded',
                    description: `Successfully reloaded the command registry and synced slash commands for the bot.`,
                    color: 'success',
                })],
            });
        } catch (error) {
            await InteractionHelper.safeEditReply(interaction, {
                embeds: [createEmbed({
                    title: 'Reload failed',
                    description: `The command registry could not be refreshed.\n\n${error.message || 'Unknown error'}`,
                    color: 'error',
                })],
            });
        }
    },
};
