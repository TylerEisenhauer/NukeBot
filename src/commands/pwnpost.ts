import {EmojiResolvable, Message} from 'discord.js'
import {uriRegex} from "../config/constants"

export async function pwnpost(args: string[], message: Message) {
    if (uriRegex.test(message.content) || message.attachments.first()) {
        const emoji: EmojiResolvable = message.guild.emojis.resolveIdentifier(process.env.EMOJI_ID)
        if (emoji) await message.react(emoji)
    }
}

export const execute: (args: string[], message: Message) => Promise<void> = async (args: string[], message: Message) => {
    return await pwnpost(args, message)
}

export const name: string = 'pwnpost'