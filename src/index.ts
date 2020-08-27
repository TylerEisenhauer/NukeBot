import {Client, Collection, Message, MessageReaction, Permissions, User, WebhookClient} from 'discord.js'
import {config} from 'dotenv-flow'
import {parseArgs} from './helpers/parsing'
import {initializeAPIClients} from './config/config'
import * as puppeteer from 'puppeteer'
import {isEqual} from 'lodash'
import * as fs from "fs"

class ExtendedClient extends Client {
    public commands?: Collection<string, any>
}

config()
const webhookClient = new WebhookClient(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN)
const client: ExtendedClient = new Client()
client.commands = new Collection()

const commandFiles: string[] = fs.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith('.js'));
commandFiles.map((file: string) => {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
})

const prefix = '!'
let cache: string[] = []
let existingProductList: string[] = []

const statusCheck = async () => {
    try {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.setViewport({
            width: 2560,
            height: 1440
        })
        await page.goto('https://novelkeys.xyz/collections/extras-group-buy')
        const newProductList: string[] = await page.evaluate(() => {
            const products: string[] = []
            document
                .querySelectorAll('#Collection > ul > li > div > div.one-whole > div')
                .forEach((element: Element) => {
                    products.push(element.textContent)
                })
            return products.sort()
        })
        if (!isEqual(existingProductList, newProductList)) {
            existingProductList = newProductList
            await webhookClient.send(`<@${process.env.ME_ID}> Page change detected <https://novelkeys.xyz/collections/extras-group-buy>`, {
                files: [await page.screenshot()]
            })
        }
        await browser.close()
    } catch (e) {
        console.log(e)
        await webhookClient.send(`Encountered an error\n${e}`)
    }
    setTimeout(statusCheck, 1000 * 60 * 10)
}
statusCheck()

client.on('ready', async () => {
    await initializeAPIClients()
    await client.user.setPresence({
        status: 'online',
        activity: {
            name: 'Kicking Doors and Slapping Whores',
            type: 'PLAYING'
        }
    })
    console.log('Bot Online')
})

client.on('message', async (message: Message) => {
    if (message.author.bot) return
    if (!message.guild) return
    let performGamaAlert: boolean = process.env.PERFORM_GAMA_ALERT === 'true'

    if (performGamaAlert && message.author.id === process.env.GAMA_ID && message.channel.id === process.env.ALERT_CHANNEL_ID) {
        await client.commands.get('gamapost').execute(null, message)
    }
    if (performGamaAlert && message.author.id === process.env.PWN_ID && message.channel.id === process.env.ALERT_CHANNEL_ID) {
        await client.commands.get('pwnpost').execute(null, message)
    }

    if (!message.content.startsWith(prefix)) return

    const args: string[] = parseArgs(prefix, message.content)
    const command: string = args.shift().toLowerCase()
    if (command === 'pwnpost' || command === 'gamapost') return

    if (command.startsWith(prefix)) return

    try {
        return await client.commands.get(command).execute(args, message)
    } catch {
        return await message.channel.send('I have no idea what the FUCK you\'re talking about')
    }
})

client.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
    if (reaction.emoji.id !== process.env.WTF_ID || cache.includes(reaction.message.id)) return

    if (reaction.partial) {
        try {
            await reaction.fetch()
        } catch (e) {
            console.error('Error fetching reaction')
            return
        }
    }

    const originalNickname: string = reaction.message.member.nickname || reaction.message.member.user.username

    if (reaction.count === 5) {
        cache.push(reaction.message.id)
        try {
            if (reaction.message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
                return await reaction.message.channel.send(`${originalNickname} has been voted an idiot, unfortunately I can't change their name`)
            }

            await reaction.message.member.setNickname('KPS Student')
            await reaction.message.channel.send(`${originalNickname} has been voted an idiot, their name has been changed as such`)
        } catch (e) {
            console.error(e)
        } finally {
            setTimeout(async () => {
                await reaction.message.member.setNickname(originalNickname)
            }, 60 * 5 * 1000) //5 Minutes
        }
    }
})

client.login(process.env.DISCORD_TOKEN).then(() => {
    console.log('Login Success')
}).catch((e) => {
    console.log(e)
})

