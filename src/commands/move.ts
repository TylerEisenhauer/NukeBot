import {Collection, GuildMember, Message, Permissions, VoiceChannel} from "discord.js"

export default async (args: string[], message: Message) => {
    if (!message.member.hasPermission(Permissions.FLAGS.MOVE_MEMBERS)) {
        return await message.channel.send(`I'm sorry ${message.member.displayName}, I'm afraid I can't let you do that`)
    }
    if (args.length != 2) {
        return await message.channel.send('Mention exactly TWO channels retard.')
    }

    const fromChannel: VoiceChannel = message.guild.channels.find((x) => {
        return x.type === 'voice' && x.name === args[0]
    }) as VoiceChannel
    const toChannel: VoiceChannel = message.guild.channels.find((x) => {
        return x.type === 'voice' && x.name === args[1]
    }) as VoiceChannel

    if (fromChannel && toChannel) {
        const users: Collection<string, GuildMember> = fromChannel.members

        users.forEach((user: GuildMember) => {
            user.setVoiceChannel(toChannel.id)
        })
    } else {
        return await message.channel.send('At least one of those channels doesn\'t exist')
    }

}