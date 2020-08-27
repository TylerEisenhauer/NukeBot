import {Collection, GuildMember, Message, Permissions, VoiceChannel} from 'discord.js'

export async function move(args: string[], message: Message) {
    if (!message.member.hasPermission(Permissions.FLAGS.MOVE_MEMBERS)) {
        // return await message.channel.send(`I'm sorry ${message.member.displayName}, I'm afraid I can't let you do that`)
        return await message.channel.send(`Can you shut the fuck up for a second? I can't help you if you're a retard.`)
    }
    if (args.length != 2) {
        return await message.channel.send('Mention exactly TWO channels retard.')
    }

    const fromChannel: VoiceChannel = message.guild.channels.cache.find((x) => {
        return x.type === 'voice' && x.name === args[0]
    }) as VoiceChannel
    const toChannel: VoiceChannel = message.guild.channels.cache.find((x) => {
        return x.type === 'voice' && x.name === args[1]
    }) as VoiceChannel

    if (fromChannel && toChannel) {
        const users: Collection<string, GuildMember> = fromChannel.members

        await message.channel.send(`Helping ${fromChannel.members.size} clowns meander to ${toChannel.name}`)

        await Promise.all(users.map((async (user: GuildMember) => {
            await user.voice.setChannel(toChannel.id)
        })))
    } else {
        return await message.channel.send('At least one of those channels doesn\'t exist')
    }
}

export const execute: (args: string[], message: Message) => Promise<Message> = async (args: string[], message: Message) => {
    return await move(args, message)
}

export const name: string = 'move'