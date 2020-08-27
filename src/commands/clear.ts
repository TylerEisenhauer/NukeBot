import {Collection, Message, Permissions} from 'discord.js'

export async function clear(args: string[], message: Message) {
    if (!message.member.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
        return await message.channel.send(`You're too much of a little bitch for this power.`)
    }

    const limit: number = parseInt(args[0]) + 1
    if (isNaN(limit)) {
        return await message.channel.send(`Did you miss the day of kindergarten where you learned what a number was? !clear {NUMBER}, moron.`)
    }
    if (limit > 100) {
        return await message.channel.send(`99 Messages or less buddy.`)
    }
    const messages: Collection<string, Message> = await message.channel.messages.fetch({limit})
    const tempMessage: Message = await message.channel.send('I can\'t leave you idiots alone for 5 minutes')

    await message.channel.bulkDelete(messages, true)
    setTimeout(async () => {
        await tempMessage.delete()
    }, 5000)
}

export const execute: (args: string[], message: Message) => Promise<Message> = async (args: string[], message: Message) => {
    return await clear(args, message)
}

export const name: string = 'clear'