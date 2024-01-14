import { DependencyContainer } from "tsyringe";

import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";

const config: IConfig = require("../config/config.json");

type ItemIds = string[]

const HEAD_ARMORZONE: string = 'Head'

const MODTITLE: string = "[Helmet Improvement Program]"

class HelmetImprovementProgram implements IPostDBLoadMod {

    public postDBLoad(container: DependencyContainer): void {
        const logger: ILogger = container.resolve<ILogger>("WinstonLogger");

        const {
            blocksEarWearValue,
            deafnessStrengthValue,
            deafnessStrengthBasedOnArmorTypeValue,
            helmetsToIgnoreValue,
        }: IConfigValues = checkConfigValues(config)

        config.debug && logger.info(`${MODTITLE} DEBUG VALUE SET TO TRUE, ENABLING ADDITIONAL LOGGING\nset the debug value to false to turn off verbose logging`)

        // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        // Get all the in-memory json found in /assets/database
        const items: IDatabaseTables = databaseServer.getTables();

        // find the items in the database
        const helmets: ItemIds = []

        logger.info(`${MODTITLE} applying changes`);

        config.debug && logger.info(`${MODTITLE} starting database scan for helmets`)
        config.debug && logger.info(`${MODTITLE} deafnessStrength is set to ${deafnessStrengthValue}, blocksEarWear modifier is set to ${blocksEarWearValue}`)
        if (deafnessStrengthBasedOnArmorTypeValue && config.debug) {
            logger.info(`${MODTITLE} deafnessStrengthBasedOnArmorTypeValue is set to ${deafnessStrengthBasedOnArmorTypeValue} values will be set one lower than armorType`)
        }

        for (const [_, item] of Object.entries(items.templates.items)) {
            config.debugHelmetScanLog && logger.info(`${MODTITLE} scanning item of id: ${item._id} to see if it is helmet`)
            const currentItem: ITemplateItem | null = item

            // if empty ignore this entry
            if (currentItem === null || Object.keys(currentItem).length < 1) {
                continue;
            }

            // Check armorZone, if the first entry is 'Head' then I assume it is a helmet
            const itemArmorZoneArr = currentItem?._props.armorZone
            let itemArmorZone = undefined
            if (itemArmorZoneArr !== undefined && itemArmorZoneArr.length > 0) {
                itemArmorZone = itemArmorZoneArr[0]
            }

            if (itemArmorZone !== undefined && itemArmorZone === HEAD_ARMORZONE) {
                const itemId = item._id
                if (checkIfInBannedList(itemId, helmetsToIgnoreValue)) {
                    config.debug && logger.info(`${MODTITLE} item of id: ${item._id} is in ban list and its stats will not be changed`)
                    continue;
                }
                config.debug && logger.info(`${MODTITLE} item of id: ${item._id} is a helmet as it has an armorZone of ${currentItem?._props.armorZone}`)
                helmets.push(itemId)
            }
        }

        let numberOfItemsEdited = 0
        let typesOfDeafness = []
        // modify the items properties
        helmets.map((helm: string) => {
            if (helm !== null && helm !== undefined) {

                config.debug && logger.info(`${MODTITLE} Starting removing penalties of helmet of id:${helm}`)

                const helmetFromDatabase = items?.templates?.items[helm];

                if (helmetFromDatabase !== undefined) {

                    config.debug && logger.info(`${MODTITLE} Item found in database, Removing Penalties of id:${helm}`)

                    let shouldIncrementCount = false

                    if (helmetFromDatabase._props.BlocksEarpiece) {
                        try {
                            helmetFromDatabase._props.BlocksEarpiece = blocksEarWearValue;
                            shouldIncrementCount = true
                        }
                        catch (err) {
                            logger.error(`${MODTITLE} an error occurred with itemId of ${helm} attempting to assign BlocksEarpiece with the values of ${blocksEarWearValue}`)
                            logger.error(`${MODTITLE} Error: ${err}`)
                        }
                    }
                    else {
                        config.debug && logger.info(`${MODTITLE} Helmet of id:${helm} BlocksEarpiece is set to ${helmetFromDatabase._props.BlocksEarpiece}, ignoring`)
                    }

                    typesOfDeafness.push(helmetFromDatabase._props.DeafStrength)

                    const currentDeafnessVal = deafnessStrengthEnum[helmetFromDatabase._props.DeafStrength]
                    // check if tiered is set otherwise set to deafnessStrengthVal
                    if (deafnessStrengthBasedOnArmorTypeValue) {
                        if (helmetFromDatabase._props.DeafStrength !== deafnessStrengthEnum.None) {
                            const nextDeafnessVal = checkNextDeafnessStrengthValue(currentDeafnessVal)
                            try {
                                if (nextDeafnessVal !== undefined && nextDeafnessVal !== null) {
                                    const prevDeafVal = helmetFromDatabase._props.DeafStrength
                                    helmetFromDatabase._props.DeafStrength = nextDeafnessVal
                                    shouldIncrementCount = true

                                    config.debug && logger.info(`${MODTITLE} deafnessStrengthBasedOnArmorTypeValue is set to ${nextDeafnessVal} from previous value of ${prevDeafVal}`)
                                }
                            }
                            catch (err) {
                                logger.error(`${MODTITLE} an error occurred with itemId of ${helm} attempting to assign deafnessStrength with the values of ${nextDeafnessVal} which `)
                                logger.error(`was determined by deafnessStrengthBasedOnArmorTypeValue which was set to ${deafnessStrengthBasedOnArmorTypeValue} in the config file`)
                                logger.error(`${MODTITLE} Error: ${err}`)
                            }
                        }
                        else {
                            config.debug && logger.info(`${MODTITLE} deafnessStrengthBasedOnArmorTypeValue is already None, ignoring`)
                        }
                    }

                    if (!deafnessStrengthBasedOnArmorTypeValue) {
                        try {
                            helmetFromDatabase._props.DeafStrength = deafnessStrengthValue
                            shouldIncrementCount = true
                        }
                        catch (err) {
                            logger.error(`${MODTITLE} an error occurred with itemId of ${helm} attempting to assign deafStrength with the values of ${deafnessStrengthValue}`)
                            logger.error(`${MODTITLE} Error: ${err}`)
                        }

                    }

                    config.debug && logger.info(`${MODTITLE} Penalties removed of helmet id:${helm}`)

                    if (shouldIncrementCount) {
                        numberOfItemsEdited += 1
                    }
                    return
                }
                // item was undefined
                logger.error(`${MODTITLE}: failed to remove penalties of item with the id: ${helm}. If this is a modded item then it may not be compatible with this mod`)
            }
        })

        logger.info(`${MODTITLE} ${numberOfItemsEdited} Helmet Penalties removed`);
        logger.info(`${MODTITLE} has finished`);
    }
}

const checkConfigValues = (configFile: IConfig): IConfigValues => {
    const config: IConfigValues = {
        blocksEarWearValue: configFile.blocksEarWear || false,
        deafnessStrengthValue: configFile.deafnessStrength || deafnessStrengthEnum.None,
        deafnessStrengthBasedOnArmorTypeValue: configFile.deafnessStrengthBasedOnArmorType || false,
        helmetsToIgnoreValue: configFile.helmetsToIgnore || [],
    }

    return config
}

const checkNextDeafnessStrengthValue = (currentDeafnessValue: deafnessStrengthEnum) => {
    if (currentDeafnessValue === undefined || currentDeafnessValue === null) {
        return;
    }

    switch (currentDeafnessValue) {
        case deafnessStrengthEnum.High:
            return deafnessStrengthEnum.Low
        case deafnessStrengthEnum.Low:
        case deafnessStrengthEnum.None:
        default:
            return deafnessStrengthEnum.None
    }
}

const checkIfInBannedList = (id: string, helmetBanList: string[]): boolean => {
    if (id === undefined) {
        return true
    }
    if (helmetBanList === undefined) {
        return false
    }

    const isInBannedHelmList = (helmetBanList.indexOf(id)) > -1

    return isInBannedHelmList
}

interface IConfig {
    debug: boolean,
    debugHelmetScanLog: boolean,
    blocksEarWear: boolean,
    deafnessStrengthBasedOnArmorType: boolean,
    deafnessStrength: deafnessStrengthEnum,
    helmetsToIgnore: string[]
}

interface IConfigValues {
    deafnessStrengthValue: deafnessStrengthEnum,
    blocksEarWearValue: boolean,
    deafnessStrengthBasedOnArmorTypeValue: boolean,
    helmetsToIgnoreValue: string[]
}

enum deafnessStrengthEnum {
    None = 'none',
    Low = 'low',
    High = 'high'
}

module.exports = {mod: new HelmetImprovementProgram()}
