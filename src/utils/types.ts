import { ReactNode } from "react";

export interface SocketProviderProps {
    children: ReactNode;
}

export interface User {
    telegramId: string;
    username?: string | null;
    goldBalance: number;
    level: number;
    expToNextLevel: number;
    exp: number;
    str: number;
    def: number;
    dex: number;
    magic: number;
    hpLevel: number;
    expHp: number;
    expToNextHpLevel: number;
    outstandingSkillPoints: number;

    // Farming & Crafting
    farmingLevel: number;
    farmingExp: number;
    expToNextFarmingLevel: number;
    craftingLevel: number;
    craftingExp: number;
    expToNextCraftingLevel: number;

    // Buffs
    doubleResourceOdds: number;
    skillIntervalReductionMultiplier: number;

    // Equipped Inventory IDs (Nullable)
    hatInventoryId?: number | null;
    armourInventoryId?: number | null;
    weaponInventoryId?: number | null;
    shieldInventoryId?: number | null;
    capeInventoryId?: number | null;
    necklaceInventoryId?: number | null;
    petInventoryId?: number | null;
    spellbookInventoryId?: number | null;

    // Equipped Items (Nullable)
    hat?: Inventory | null;
    armour?: Inventory | null;
    weapon?: Inventory | null;
    shield?: Inventory | null;
    cape?: Inventory | null;
    necklace?: Inventory | null;
    pet?: Inventory | null;
    spellbook?: Inventory | null;

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
    expToNextLevel: 83,
    exp: 0,
    str: 1,
    def: 1,
    dex: 1,
    magic: 1,
    hpLevel: 1,
    expHp: 0,
    expToNextHpLevel: 83,
    outstandingSkillPoints: 0,
    farmingLevel: 1,
    farmingExp: 0,
    expToNextFarmingLevel: 83,
    craftingLevel: 1,
    craftingExp: 0,
    expToNextCraftingLevel: 83,
    doubleResourceOdds: 0.01,
    skillIntervalReductionMultiplier: 0,
    hatInventoryId: null,
    armourInventoryId: null,
    weaponInventoryId: null,
    shieldInventoryId: null,
    capeInventoryId: null,
    necklaceInventoryId: null,
    petInventoryId: null,
    spellbookInventoryId: null,
    hat: null,
    armour: null,
    weapon: null,
    shield: null,
    cape: null,
    necklace: null,
    pet: null,
    spellbook: null,
    inventory: [],
    combat: null,
    equippedSlimeId: null,
    equippedSlime: null,
};

export interface Combat {
    userId: string;
    str: number;
    def: number;
    dex: number;
    magic: number;
    maxHp: number;
    hp: number;
}

export interface Inventory {
    id: number;
    userId: string;
    itemId: number | null;
    equipmentId: number | null;
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
    imgsrc: string;
    buyPriceGP?: number | null;
    sellPriceGP: number;
    buyPriceDittoWei?: number | null;
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
    farmingExp?: number | null;
    buyPriceGP?: number | null;
    sellPriceGP: number;
    buyPriceDittoWei?: number | null;
    statEffectId?: number | null;
    statEffect?: StatEffect | null;
}

export interface StatEffect {
    id: number;
    str?: number | null;
    strEffect?: EffectType | null;
    def?: number | null;
    defEffect?: EffectType | null;
    dex?: number | null;
    dexEffect?: EffectType | null;
    magic?: number | null;
    magicEffect?: EffectType | null;
    hp?: number | null;
    hpEffect?: EffectType | null;
    maxHp?: number | null;
    maxHpEffect?: EffectType | null;
    doubleResourceOdds?: number | null;
    skillIntervalReductionMultiplier?: number | null;
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
    pet = "pet",
    spellbook = "spellbook",
}

export enum EffectType {
    add = "+",
    mul = "*",
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