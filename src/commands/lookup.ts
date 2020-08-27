import {Message} from 'discord.js'
import {Character, Encounters, Expansions, Item, Instance, Mode} from '../types/character.Types'
import {find} from 'lodash'
import {utc} from 'moment'
import {DungeonRun, RaiderIOCharacterData} from '../types/raiderio.Types'
import {getCharacter, getCharacterEquipment, getCharacterMedia, getCharacterRaidProgress} from '../api/blizzard'
import {getCharacterData} from '../api/raiderio'

export async function lookup(args: string[], message: Message) {
    const character: Character = await getCharacter(args[0], args[1])
    if (!character) {
        return await message.channel.send('Character not found')
    }
    character.encounters = await getCharacterRaidProgress(args[0], args[1])
    character.equipment = await getCharacterEquipment(args[0], args[1])
    character.media = await getCharacterMedia(args[0], args[1])

    const raiderIOData: RaiderIOCharacterData = await getCharacterData(['mythic_plus_best_runs', 'mythic_plus_scores_by_season:current'], args[0], args[1])

    return await message.channel.send({
        embed: {
            author: {
                name: `${character.name} - ${character.realm.name.en_US} | ${character.active_spec.name.en_US} ${character.character_class.name.en_US} | ${character.equipped_item_level} ilvl | ${getHeartOfAzerothLevel(character.equipment)} HoA`,
                url: `https://worldofwarcraft.com/en-us/character/${args[0]}/${args[1]}`
            },
            thumbnail: {
                url: character.media.avatar_url
            },
            color: 3447003,
            description: 'Character data and stuff',
            fields: [
                {
                    name: 'Raid Progress',
                    value: buildRecentRaidList(character.encounters),
                    inline: true
                },
                {
                    name: 'Mythic Plus',
                    value: buildMythicPlusDungeonList(raiderIOData),
                    inline: true
                }
            ]
        }
    })
}

function buildRecentRaidList(raids: Encounters[]): string {
    let dataString: string = ''

    if (!raids) {
        dataString = '**Battle.net API is Down**'
    } else {
        const currentExpansion: Encounters = find(raids, (x: Encounters) => {
            return x.expansion.id === Expansions.BattleForAzeroth
        })
        for (let i: number = currentExpansion.instances.length - 1; i >= 0; i--) {
            const raid: Instance = currentExpansion.instances[i]
            const highestDifficulty: Mode = raid.modes[raid.modes.length - 1]
            dataString = dataString.concat(`**${raid.instance.name}:** ${highestDifficulty.progress.completed_count}/${highestDifficulty.progress.total_count}${highestDifficulty.difficulty.type.slice(0, 1)}\n`)
        }
    }
    return dataString
}

function buildMythicPlusDungeonList(raiderIOData: RaiderIOCharacterData): string {
    let dataString: string

    if (!raiderIOData) {
        dataString = '**RaiderIO is down AF**'
    } else {
        dataString = `Raider.IO Score: ${raiderIOData.mythic_plus_scores_by_season[0].scores.all}\n`
        for (let i = 0; i < Math.min(raiderIOData.mythic_plus_best_runs.length, 3); i++) {
            const dungeon: DungeonRun = raiderIOData.mythic_plus_best_runs[i]
            const formatString = dungeon.clear_time_ms >= 3600000 ? 'HH:mm:ss' : 'mm:ss'
            const timeString = utc(dungeon.clear_time_ms).format(formatString)
            dataString = dataString.concat(`**+${dungeon.mythic_level}** - ${dungeon.short_name} - ${timeString}\n`)
        }
    }

    return dataString
}

function getHeartOfAzerothLevel(items: Item[]) {
    const hoa: Item = find(items, (x) => {
        return x.slot.type === 'NECK'
    })

    return hoa.azerite_details.level.value
}

export const execute: (args: string[], message: Message) => Promise<Message> = async (args: string[], message: Message) => {
    return await lookup(args, message)
}

export const name: string = 'lookup'