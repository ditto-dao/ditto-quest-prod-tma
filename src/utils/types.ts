import { ReactNode } from "react";

export interface SocketProviderProps {
    children: ReactNode;
}

export interface User {
    telegramId: number;
    username?: string;
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
    farmingLevel: number;
    farmingExp: number;
    expToNextFarmingLevel: number;
    craftingLevel: number;
    craftingExp: number;
    expToNextCraftingLevel: number;
    hatId?: number;
    armourId?: number;
    weaponId?: number;
    shieldId?: number;
    capeId?: number;
    necklaceId?: number;
    petId?: number;
    spellbookId?: number;
    hat?: Inventory;
    armour?: Inventory;
    weapon?: Inventory;
    shield?: Inventory;
    cape?: Inventory;
    necklace?: Inventory;
    pet?: Inventory;
    spellbook?: Inventory;
    inventory: Inventory[]
    combat?: Combat;
    slimes?: SlimeWithTraits[];
    equippedSlime?: SlimeWithTraits;
}

// Default User object
export const defaultUser: User = {
    telegramId: 0,
    username: "",
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
    hatId: undefined,
    armourId: undefined,
    weaponId: undefined,
    shieldId: undefined,
    capeId: undefined,
    necklaceId: undefined,
    petId: undefined,
    spellbookId: undefined,
    hat: undefined,
    armour: undefined,
    weapon: undefined,
    shield: undefined,
    cape: undefined,
    necklace: undefined,
    pet: undefined,
    spellbook: undefined,
    inventory: [],
    combat: undefined
};

export interface Combat {
    userId: number;
    str: number;
    def: number;
    dex: number;
    magic: number;
    hp: number;
    hpLevel: number;
}

export interface Inventory {
    id: number;
    userId: number;
    itemId: number | null;
    equipmentId: number | null;
    quantity: number;
    order: number;
    createdAt: string; // Date converted to string for JSON compatibility
    item?: Item | null; // Include Item details if populated
    equipment?: Equipment | null; // Include Equipment details if populated
};

export interface Equipment {
    id: number;
    name: string;
    description: string;
    imgsrc: string;
    str: number;
    def: number;
    dex: number;
    magic: number;
    hp: number;
    rarity: Rarity;
    type: EquipmentType;
}

export interface Item {
    itemId: number;
    name: string;
    description: string;
    imgsrc: string;
    rarity: Rarity;
    farmingDurationS?: number;
    farmingLevelRequired?: number;
    farmingExp?: number;
    consumableId?: number;
    consumable?: Consumable;
}

export interface Consumable {
    id: number;
    str?: number;
    strEffect?: EffectType;
    def?: number;
    defEffect?: EffectType;
    dex?: number;
    dexEffect?: EffectType;
    magic?: number;
    magicEffect?: EffectType;
    hp?: number;
    hpEffect?: EffectType;
    maxHp?: number;
    maxHpEffect?: EffectType;
    durationS?: number;
    Item: Item[];
}

export interface CraftingRecipe {
    id: number;
    equipmentId: number;
    equipment: Equipment;
    durationS: number;
    craftingLevelRequired: number;
    craftingExp: number;
    CraftingRecipeItems: CraftingRecipeItems[];
}

export interface CraftingRecipeItems {
    id: number;
    recipeId: number;
    recipe: CraftingRecipe;
    itemId: number;
    item: Item;
    quantity: number;
}

export enum Rarity {
    S = "S",
    A = "A",
    B = "B",
    C = "C",
    D = "D"
}

export enum EquipmentType {
    hat = "hat",
    armour = "armour",
    weapon = "weapon",
    shield = "shield",
    cape = "cape",
    necklace = "necklace",
    pet = "pet",
    spellbook = "spellbook"
}

export enum EffectType {
    plus = "+",
    times = "*"
}

export interface SlimeTrait {
    id: number;
    name: string;
    type: TraitType;
    rarity: Rarity;
    pairId: number | null;
    mutationId: number | null;
    str: number;
    def: number;
    dex: number;
    magic: number;
    hp: number;
}

export interface SlimeWithTraits {
    id: number;
    ownerId: number;
    generation: number;
    AuraDominant: SlimeTrait;
    AuraHidden1: SlimeTrait;
    AuraHidden2: SlimeTrait;
    AuraHidden3: SlimeTrait;
    BodyDominant: SlimeTrait;
    BodyHidden1: SlimeTrait;
    BodyHidden2: SlimeTrait;
    BodyHidden3: SlimeTrait;
    CoreDominant: SlimeTrait;
    CoreHidden1: SlimeTrait;
    CoreHidden2: SlimeTrait;
    CoreHidden3: SlimeTrait;
    HeadpieceDominant: SlimeTrait;
    HeadpieceHidden1: SlimeTrait;
    HeadpieceHidden2: SlimeTrait;
    HeadpieceHidden3: SlimeTrait;
    TailDominant: SlimeTrait;
    TailHidden1: SlimeTrait;
    TailHidden2: SlimeTrait;
    TailHidden3: SlimeTrait;
    ArmsDominant: SlimeTrait;
    ArmsHidden1: SlimeTrait;
    ArmsHidden2: SlimeTrait;
    ArmsHidden3: SlimeTrait;
    EyesDominant: SlimeTrait;
    EyesHidden1: SlimeTrait;
    EyesHidden2: SlimeTrait;
    EyesHidden3: SlimeTrait;
    MouthDominant: SlimeTrait;
    MouthHidden1: SlimeTrait;
    MouthHidden2: SlimeTrait;
    MouthHidden3: SlimeTrait;
}

export type TraitType =
    | 'Aura'
    | 'Body'
    | 'Core'
    | 'Headpiece'
    | 'Tail'
    | 'Arms'
    | 'Eyes'
    | 'Mouth';