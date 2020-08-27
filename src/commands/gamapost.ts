import {Message} from 'discord.js'
import {uriRegex} from "../config/constants"

export async function gamapost(args: string[], message: Message) {
    if (uriRegex.test(message.content) || message.attachments.first()) {
        return message.channel.send('WARNING, POTENTIAL GAMAPOST, PROCEED WITH CAUTION')
    }
}

export const execute: (args: string[], message: Message) => Promise<Message> = async (args: string[], message: Message) => {
    return await gamapost(args, message)
}

export const name: string = 'gamapost'