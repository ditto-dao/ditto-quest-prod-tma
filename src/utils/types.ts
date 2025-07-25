import { ReactNode } from "react";

export interface SocketProviderProps {
    children: ReactNode;
}

export interface User {
    telegramId: string;
    username?: string | null;
    goldBalance: number;

    // Base ability stats
    level: number;
    expToNextLevel: number;
    exp: number;
    str: number;
    def: number;
    dex: number;
    luk: number;
    magic: number;
    hpLevel: number;
    expHp: number;
    expToNextHpLevel: number;
    outstandingSkillPoints: number;
    statResetPoints: number;

    // Base combat stats (directly on User)
    maxHp: number;
    atkSpd: number;
    acc: number;
    eva: number;
    maxMeleeDmg: number;
    maxRangedDmg: number;
    maxMagicDmg: number;
    critChance: number;
    critMultiplier: number;
    dmgReduction: number;
    magicDmgReduction: number;
    hpRegenRate: number;
    hpRegenAmount: number;

    lastBattleEndTimestamp?: Date | null; // only fetched on login, not updated

    // Farming & Crafting
    farmingLevel: number;
    farmingExp: number;
    expToNextFarmingLevel: number;
    craftingLevel: number;
    craftingExp: number;
    expToNextCraftingLevel: number;

    // Max inventory
    maxInventorySlots: number;
    maxSlimeInventorySlots: number;

    // Equipped Inventory IDs (Nullable)
    hatInventoryId?: number | null;
    armourInventoryId?: number | null;
    weaponInventoryId?: number | null;
    shieldInventoryId?: number | null;
    capeInventoryId?: number | null;
    necklaceInventoryId?: number | null;

    // Equipped Items (Nullable)
    hat?: Inventory | null;
    armour?: Inventory | null;
    weapon?: Inventory | null;
    shield?: Inventory | null;
    cape?: Inventory | null;
    necklace?: Inventory | null;

    // Relations
    inventory: Inventory[];
    combat?: Combat | null;
    slimes?: SlimeWithTraits[];
    equippedSlimeId?: number | null;
    equippedSlime?: SlimeWithTraits | null;
}

// Default User object
export const defaultUser: User = {
    telegramId: "",
    username: null,
    goldBalance: 0,
    level: 1,
    expToNextLevel: 570,
    exp: 0,
    str: 1,
    def: 1,
    dex: 1,
    luk: 1,
    magic: 1,
    hpLevel: 1,
    expHp: 0,
    expToNextHpLevel: 83,
    outstandingSkillPoints: 0,
    statResetPoints: 0,
    maxHp: 100,
    atkSpd: 10,
    acc: 100,
    eva: 100,
    maxMeleeDmg: 30,
    maxRangedDmg: 30,
    maxMagicDmg: 30,
    critChance: 0.00398,
    critMultiplier: 1.29,
    dmgReduction: 15,
    magicDmgReduction: 10,
    hpRegenRate: 20,
    hpRegenAmount: 10.8,
    lastBattleEndTimestamp: null,
    farmingLevel: 1,
    farmingExp: 0,
    expToNextFarmingLevel: 570,
    craftingLevel: 1,
    craftingExp: 0,
    expToNextCraftingLevel: 570,
    maxInventorySlots: 40,
    maxSlimeInventorySlots: 40,
    hatInventoryId: null,
    armourInventoryId: null,
    weaponInventoryId: null,
    shieldInventoryId: null,
    capeInventoryId: null,
    necklaceInventoryId: null,
    hat: null,
    armour: null,
    weapon: null,
    shield: null,
    cape: null,
    necklace: null,
    inventory: [],
    combat: null,
    equippedSlimeId: null,
    equippedSlime: null,
};

export interface Combat {
    id: number;
    attackType: 'Melee' | 'Ranged' | 'Magic';
    cp: string;
    hp: number;
    maxHp: number;
    atkSpd: number;
    acc: number;
    eva: number;
    maxMeleeDmg: number;
    maxRangedDmg: number;
    maxMagicDmg: number;
    critChance: number;
    critMultiplier: number;
    dmgReduction: number;
    magicDmgReduction: number;
    hpRegenRate: number;
    hpRegenAmount: number;
    meleeFactor: number;
    rangeFactor: number;
    magicFactor: number;
    reinforceAir: number;
    reinforceWater: number;
    reinforceEarth: number;
    reinforceFire: number;
}

export const defaultCombat: Combat = {
    id: 0,
    attackType: 'Melee',
    cp: "129",
    hp: 100,
    maxHp: 100,
    atkSpd: 10,
    acc: 10,
    eva: 10,
    maxMeleeDmg: 30,
    maxRangedDmg: 30,
    maxMagicDmg: 30,
    critChance: 0.006623,
    critMultiplier: 1.290,
    dmgReduction: 10,
    magicDmgReduction: 10,
    hpRegenRate: 20,
    hpRegenAmount: 5.7,
    meleeFactor: 0,
    rangeFactor: 0,
    magicFactor: 0,
    reinforceAir: 0,
    reinforceWater: 0,
    reinforceEarth: 0,
    reinforceFire: 0
}

export interface Inventory {
    id: number;
    userId: string;
    itemId?: number | null;
    equipmentId?: number | null;
    quantity: number;
    order: number;
    createdAt: string; // Date as string for JSON compatibility
    item?: Item | null;
    equipment?: Equipment | null;
}

export interface Equipment {
    id: number;
    name: string;
    description: string;
    attackType?: 'Melee' | 'Ranged' | 'Magic';
    imgsrc: string;
    buyPriceGP?: number | null;
    sellPriceGP: number;
    buyPriceDittoWei?: number | null;
    requiredLvlCombat: number;
    requiredLvlCraft: number;
    statEffectId?: number | null;
    statEffect?: StatEffect | null;
    rarity: Rarity;
    type: EquipmentType;
}

export interface Item {
    id: number;
    name: string;
    description: string;
    imgsrc: string;
    rarity: Rarity;
    farmingDurationS?: number | null;
    farmingLevelRequired?: number | null;
    requiredLvl: number;
    farmingExp?: number | null;
    buyPriceGP?: number | null;
    sellPriceGP: number;
    buyPriceDittoWei?: number | null;
    statEffectId?: number | null;
    statEffect?: StatEffect | null;
}

export interface StatEffect {
    id: number;

    maxHpMod?: number | null;
    maxHpEffect?: EffectType | null;

    atkSpdMod?: number | null;
    atkSpdEffect?: EffectType | null;

    accMod?: number | null;
    accEffect?: EffectType | null;

    evaMod?: number | null;
    evaEffect?: EffectType | null;

    maxMeleeDmgMod?: number | null;
    maxMeleeDmgEffect?: EffectType | null;

    maxRangedDmgMod?: number | null;
    maxRangedDmgEffect?: EffectType | null;

    maxMagicDmgMod?: number | null;
    maxMagicDmgEffect?: EffectType | null;

    critChanceMod?: number | null;
    critChanceEffect?: EffectType | null;

    critMultiplierMod?: number | null;
    critMultiplierEffect?: EffectType | null;

    dmgReductionMod?: number | null;
    dmgReductionEffect?: EffectType | null;

    magicDmgReductionMod?: number | null;
    magicDmgReductionEffect?: EffectType | null;

    hpRegenRateMod?: number | null;
    hpRegenRateEffect?: EffectType | null;

    hpRegenAmountMod?: number | null;
    hpRegenAmountEffect?: EffectType | null;

    meleeFactor?: number | null;
    rangeFactor?: number | null;
    magicFactor?: number | null;

    reinforceAir?: number | null;
    reinforceWater?: number | null;
    reinforceEarth?: number | null;
    reinforceFire?: number | null;

    efficiencySkillIntervalMod?: number | null;
    efficiencyDoubleResourceMod?: number | null;
    efficiencyDoubleSkillExpMod?: number | null;
    efficiencyDoubleCombatExpMod?: number | null;
    efficiencyFlatSkillExpMod?: number | null;
    efficiencyFlatCombatExpMod?: number | null;

    durationS?: number | null;
}

export interface SlimeTrait {
    id: number;
    name: string;
    type: TraitType;
    rarity: Rarity;
    pair0Id?: number | null;
    mutation0Id?: number | null;
    pair1Id?: number | null;
    mutation1Id?: number | null;
    statEffectId?: number | null;
    statEffect?: StatEffect | null;
}

export interface SlimeWithTraits {
    id: number;
    ownerId: string;
    generation: number;
    imageUri: string;
    BodyDominant: SlimeTrait;
    BodyHidden1: SlimeTrait;
    BodyHidden2: SlimeTrait;
    BodyHidden3: SlimeTrait;
    PatternDominant: SlimeTrait;
    PatternHidden1: SlimeTrait;
    PatternHidden2: SlimeTrait;
    PatternHidden3: SlimeTrait;
    PrimaryColourDominant: SlimeTrait;
    PrimaryColourHidden1: SlimeTrait;
    PrimaryColourHidden2: SlimeTrait;
    PrimaryColourHidden3: SlimeTrait;
    AccentDominant: SlimeTrait;
    AccentHidden1: SlimeTrait;
    AccentHidden2: SlimeTrait;
    AccentHidden3: SlimeTrait;
    DetailDominant: SlimeTrait;
    DetailHidden1: SlimeTrait;
    DetailHidden2: SlimeTrait;
    DetailHidden3: SlimeTrait;
    EyeColourDominant: SlimeTrait;
    EyeColourHidden1: SlimeTrait;
    EyeColourHidden2: SlimeTrait;
    EyeColourHidden3: SlimeTrait;
    EyeShapeDominant: SlimeTrait;
    EyeShapeHidden1: SlimeTrait;
    EyeShapeHidden2: SlimeTrait;
    EyeShapeHidden3: SlimeTrait;
    MouthDominant: SlimeTrait;
    MouthHidden1: SlimeTrait;
    MouthHidden2: SlimeTrait;
    MouthHidden3: SlimeTrait;
}

export type TraitType =
    | "Body"
    | "Pattern"
    | "PrimaryColour"
    | "Accent"
    | "Detail"
    | "EyeColour"
    | "EyeShape"
    | "Mouth";

export enum Rarity {
    S = "S",
    A = "A",
    B = "B",
    C = "C",
    D = "D",
}

export enum EquipmentType {
    hat = "hat",
    armour = "armour",
    weapon = "weapon",
    shield = "shield",
    cape = "cape",
    necklace = "necklace",
}

export type EffectType = 'add' | 'mul';

export type FullMonster = {
    id: number;
    name: string;
    description: string;
    imgsrc: string;
    level: number;

    str: number;
    def: number;
    dex: number;
    luk: number;
    magic: number;
    hpLevel: number;

    maxHp: number;
    atkSpd: number;
    acc: number;
    eva: number;
    maxMeleeDmg: number;
    maxRangedDmg: number;
    maxMagicDmg: number;
    critChance: number;
    critMultiplier: number;
    dmgReduction: number;
    magicDmgReduction: number;
    hpRegenRate: number;
    hpRegenAmount: number;

    exp: number;
    minGoldDrop: number;
    maxGoldDrop: number;

    combat: Combat;

    statEffects?: StatEffect[];

    drops: {
        id: number;
        dropRate: number;
        quantity: number;
        item: {
            id: number;
            name: string;
            description: string;
            imgsrc: string;
            rarity: string;
        } | null;
        equipment: {
            id: number;
            name: string;
            slot: string;
            imgsrc: string;
            rarity: string;
        } | null;
    }[];
};

export const defaultMonster: FullMonster = {
    id: 0,
    name: "",
    description: "",
    imgsrc: "",
    level: 1,
    str: 1,
    def: 1,
    dex: 1,
    luk: 1,
    magic: 1,
    hpLevel: 1,
    maxHp: 100,
    atkSpd: 10,
    acc: 100,
    eva: 100,
    maxMeleeDmg: 20,
    maxRangedDmg: 20,
    maxMagicDmg: 20,
    critChance: 0.006623,
    critMultiplier: 1.29,
    dmgReduction: 10,
    magicDmgReduction: 10,
    hpRegenRate: 20,
    hpRegenAmount: 5.7,
    exp: 0,
    minGoldDrop: 0,
    maxGoldDrop: 0,
    combat: defaultCombat,
    statEffects: [],
    drops: []
}

export interface Domain {
    id: number;
    name: string;
    description: string;
    imgsrc: string;
    entryPriceGP: number | null;
    entryPriceDittoWei: string | null;
    minCombatLevel: number | null;
    maxCombatLevel: number | null;
    monsters: DomainMonsterEntry[];
}

export interface DomainMonsterEntry {
    monster: FullMonster;
    spawnRate: number;
}

export interface Dungeon {
    id: number;
    name: string;
    description: string;
    imgsrc: string;
    monsterGrowthFactor: number;
    entryPriceGP: number | null;
    entryPriceDittoWei: string | null; // Decimal values are returned as strings
    minCombatLevel: number | null;
    maxCombatLevel: number | null;
    isActive: boolean;
    monsterSequence: FullMonster[];
}

export interface DungeonLeaderboard {
    id: number;
    userId: string;
    dungeonId: number;
    monstersKilled: number;
    damageDealt: number;
    damageTaken: number;
    timeElapsedMs: number;
    runDate: string;
    score: number;
    user: User;
    dungeon: Dungeon;
}

export interface MonsterDrop {
    id: number;
    monsterId: number;
    itemId: number | null;
    equipmentId: number | null;
    dropRate: number;
    quantity: number;
    item: Item | null;
    equipment: Equipment | null;
}

export interface DittoBalanceBN {
    liveBalance: bigint;
    accumulatedBalance: bigint;
    isBot: boolean;
    isAdmin: boolean;
}

export interface UserBalanceUpdate {
    userId: string;
    liveBalanceChange: string;
    accumulatedBalanceChange: string;
    notes?: string;
}

export type UserMission = {
    telegramId: string;
    type: "FARM" | "CRAFT" | "COMBAT" | "BREED" | "GACHA";
    label: string;

    // Optional target identifiers
    itemId?: number;        // FARM
    equipmentId?: number;   // CRAFT
    monsterId?: number;     // COMBAT
    slimeRarity?: "S" | "A" | "B" | "C" | "D"; // BREED or GACHA

    quantity: number;
    progress: number;
    rewardDitto: string; // in wei as string for consistency with backend
    imgsrc?: string;

    round: number;
    claimed: boolean;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
};

export interface UserEfficiencyStats {
    id: number;
    userId: string;
    skillIntervalMultiplier: number;
    doubleResourceChance: number;
    doubleSkillExpChance: number;
    doubleCombatExpChance: number;
    flatSkillExpBoost: number;
    flatCombatExpBoost: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

export const defaultEfficiencyStats: UserEfficiencyStats = {
    id: -1,
    userId: "",
    skillIntervalMultiplier: 0.0,
    doubleResourceChance: 0.0,
    doubleSkillExpChance: 0.0,
    doubleCombatExpChance: 0.0,
    flatSkillExpBoost: 0,
    flatCombatExpBoost: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
}

export type ShopItemType = "EQUIPMENT" | "ITEM" | "SERVICE";

export type ServiceType =
    | "STAT_RESET_POINT"
    | "INVENTORY_SLOT"
    | "SLIME_INVENTORY_SLOT";

export interface ShopItemData {
    id: number;
    name: string;
    type: ShopItemType;
    equipmentId: number | null;
    itemId: number | null;
    serviceType: ServiceType | null;
    priceGP: number;
    priceDittoWei: string;
    priceStars: number | null;
    isActive: boolean;
    imgsrc: string;
    description: string;
    createdAt: Date;
}