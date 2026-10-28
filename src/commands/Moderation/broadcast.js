import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { replyUserError, ErrorTypes } from '../../utils/errorHandler.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';
import { sanitizeMarkdown } from '../../utils/validation.js';

const SEND_DELAY_MS = 250;

function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export default {
    data: new SlashCommandBuilder()
        .setName('broadcast')
        .setDescription('Send a direct message to every non-bot member in this server')
        .addStringOption((option) =>
            option
                .setName('message')
                .setDescription('The message to send')
                .setMaxLength(2000)
                .setRequired(true),
        )
        .addBooleanOption((option) =>
            option
                .setName('confirm')
                .setDescription('Confirm that this will message every member who accepts DMs')
                .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    category: 'Moderation',

    async execute(interaction) {
        if (!interaction.inGuild()) {
            return await replyUserError(interaction, {
                type: ErrorTypes.UNKNOWN,
                message: 'This command can only be used in a server.',
            });
        }

        const message = interaction.options.getString('message', true).trim();
        const confirmed = interaction.options.getBoolean('confirm', true);

        if (!confirmed) {
            return await replyUserError(interaction, {
                type: ErrorTypes.USER_INPUT,
                message: 'Set confirm to true when you are ready to message every non-bot member in this server.',
            });
        }

        if (!message) {
            return await replyUserError(interaction, {
                type: ErrorTypes.USER_INPUT,
                message: 'The broadcast message cannot be empty.',
            });
        }

        const deferSuccess = await InteractionHelper.safeDefer(interaction, { flags: ['Ephemeral'] });
        if (!deferSuccess) {
            logger.warn('Broadcast interaction defer failed', {
                userId: interaction.user.id,
                guildId: interaction.guildId,
            });
            return;
        }

        const sanitizedMessage = sanitizeMarkdown(message);
        const members = await interaction.guild.members.fetch();
        let sent = 0;
        let failed = 0;
        let skipped = 0;

        for (const member of members.values()) {
            if (member.user.bot || member.id === interaction.client.user.id) {
                skipped += 1;
                continue;
            }

            try {
                await member.send(sanitizedMessage);
                sent += 1;
            } catch (error) {
                failed += 1;
                logger.debug('Broadcast DM failed', {
                    guildId: interaction.guildId,
                    userId: member.id,
                    error: error.message,
                });
            }

            await wait(SEND_DELAY_MS);
        }

        logger.info('Server broadcast completed', {
            guildId: interaction.guildId,
            executorId: interaction.user.id,
            sent,
            failed,
            skipped,
            messageLength: sanitizedMessage.length,
        });

        return await InteractionHelper.safeEditReply(interaction, {
            content: `Broadcast complete. Sent: ${sent}. Failed: ${failed}. Skipped bots: ${skipped}.`,
        });
    },
};