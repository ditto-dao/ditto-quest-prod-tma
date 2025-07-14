import { formatUnits } from "ethers";
import { DittoBalanceBN, Rarity, SlimeWithTraits, StatEffect, UserBalanceUpdate } from "./types";
import { DEVELOPMENT_FUNDS_KEY, DITTO_DECIMALS } from "./config";
import Decimal from "decimal.js";

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getChildTraitProbabilities(sire: SlimeWithTraits, dame: SlimeWithTraits) {
    const traitTypes = ["Body", "Pattern", "PrimaryColour", "Accent", "Detail", "EyeColour", "EyeShape", "Mouth"] as const;
    const probabilities = {
        D: 37.5,
        H1: 9.4,
        H2: 2.3,
        H3: 0.8,
    };

    const result: Record<
        string,
        { name: string; rarity: string; probability: number }[]
    > = {};

    for (const trait of traitTypes) {
        // Use explicit key types for indexing
        const sireTraits = [
            { name: sire[`${trait}Dominant`].name, rarity: sire[`${trait}Dominant`].rarity, weight: probabilities.D },
            { name: sire[`${trait}Hidden1`].name, rarity: sire[`${trait}Hidden1`].rarity, weight: probabilities.H1 },
            { name: sire[`${trait}Hidden2`].name, rarity: sire[`${trait}Hidden2`].rarity, weight: probabilities.H2 },
            { name: sire[`${trait}Hidden3`].name, rarity: sire[`${trait}Hidden3`].rarity, weight: probabilities.H3 },
        ];

        const dameTraits = [
            { name: dame[`${trait}Dominant`].name, rarity: dame[`${trait}Dominant`].rarity, weight: probabilities.D },
            { name: dame[`${trait}Hidden1`].name, rarity: dame[`${trait}Hidden1`].rarity, weight: probabilities.H1 },
            { name: dame[`${trait}Hidden2`].name, rarity: dame[`${trait}Hidden2`].rarity, weight: probabilities.H2 },
            { name: dame[`${trait}Hidden3`].name, rarity: dame[`${trait}Hidden3`].rarity, weight: probabilities.H3 },
        ];

        // Combine sire and dame traits into a single array
        const combinedTraits = [...sireTraits, ...dameTraits];

        // Aggregate probabilities for each unique trait
        const traitProbabilities: Record<string, { name: string; rarity: string; probability: number }> = {};
        combinedTraits.forEach(({ name, rarity, weight }) => {
            if (!traitProbabilities[name]) {
                traitProbabilities[name] = { name, rarity, probability: 0 };
            }
            traitProbabilities[name].probability += weight;
        });

        // Sort the traits by probability in descending order
        const sortedTraits = Object.values(traitProbabilities).sort(
            (a, b) => b.probability - a.probability
        );

        // Add the sorted traits to the result
        result[trait] = sortedTraits;
    }

    return result;
}

export function getHighestDominantTraitRarity(slime: SlimeWithTraits): Rarity | "SS" {
    const rarityRank: Record<Rarity, number> = {
        [Rarity.S]: 5,
        [Rarity.A]: 4,
        [Rarity.B]: 3,
        [Rarity.C]: 2,
        [Rarity.D]: 1,
    };

    const dominantTraits = [
        slime.BodyDominant,
        slime.PatternDominant,
        slime.PrimaryColourDominant,
        slime.AccentDominant,
        slime.DetailDominant,
        slime.EyeColourDominant,
        slime.EyeShapeDominant,
        slime.MouthDominant,
    ];

    let highest: Rarity = Rarity.D;
    let sRankCount = 0;

    for (const trait of dominantTraits) {
        if (trait.rarity === Rarity.S) sRankCount++;
        if (rarityRank[trait.rarity] > rarityRank[highest]) {
            highest = trait.rarity;
        }
    }

    if (sRankCount >= 3) return "SS";
    return highest;
}

export function formatNumberWithSuffix(value: number): string {
    if (value < 1000) {
        return parseFloat(value.toFixed(2)).toString(); // trims trailing zeros
    }

    const suffixes = ["", "k", "m", "b"];
    let suffixIndex = 0;

    while (value >= 1000 && suffixIndex < suffixes.length - 1) {
        value /= 1000;
        suffixIndex++;
    }

    // Use toFixed, then parseFloat to remove trailing zeros
    const fixed = value.toFixed(value < 10 ? 3 : value < 100 ? 2 : 1);
    const trimmed = parseFloat(fixed).toString();

    return `${trimmed}${suffixes[suffixIndex]}`;
}

export function formatDecimalWithCommas(num: Decimal): string {
    const n = num.toNumber();
    if (n < 1000) return num.toFixed(0); // e.g. 973
    return n.toLocaleString("en-US");
}

// Format with suffix, like "1.23m", "5.6k"
export function formatDecimalWithSuffix(value: Decimal): string {
    const thousand = new Decimal(1000);
    const suffixes = ["", "k", "m", "b", "t"];
    let suffixIndex = 0;

    while (value.gte(thousand) && suffixIndex < suffixes.length - 1) {
        value = value.div(thousand);
        suffixIndex++;
    }

    const v = value.toNumber();
    const fixed =
        v < 10
            ? value.toFixed(3)
            : v < 100
                ? value.toFixed(2)
                : value.toFixed(1);

    const trimmed = parseFloat(fixed).toString(); // strips trailing zeros

    return `${trimmed}${suffixes[suffixIndex]}`;
}

export function formatDecimalWithSuffix3sf(value: Decimal): string {
    const thousand = new Decimal(1000);
    const suffixes = ["", "k", "m", "b", "t"];
    let suffixIndex = 0;

    while (value.gte(thousand) && suffixIndex < suffixes.length - 1) {
        value = value.div(thousand);
        suffixIndex++;
    }

    // Round to 3 significant figures
    const rounded = new Decimal(value.toSignificantDigits(3));
    return `${rounded.toString()}${suffixes[suffixIndex]}`;
}

export function formatNumberForInvQty(num: number): string {
    if (num < 1000) {
        // Return the number as a string if less than 1000
        return num.toString();
    } else if (num < 100000) {
        // Format numbers less than 6 digits with commas
        return num.toLocaleString('en-US');
    } else if (num >= 100000 && num < 1000000) {
        // Format numbers in thousands (k) with 2 decimal places
        return (num / 1000).toFixed(2) + 'k';
    } else {
        // Format numbers in millions (m) with 2 decimal places
        return (num / 1000000).toFixed(2) + 'm';
    }
}

export function getBreedingTimesByGeneration(gen: number): number {
    if (gen < 1) {
        return 1800;
    } else if (gen <= 3) {
        return 2700;
    } else if (gen <= 5) {
        return 3600;
    } else if (gen <= 7) {
        return 7200;
    } else {
        return 10800;
    }
}

export function formatDuration(seconds: number): string {
    const timeUnits = {
        w: Math.floor(seconds / (7 * 24 * 60 * 60)), // Weeks
        d: Math.floor((seconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60)), // Days
        h: Math.floor((seconds % (24 * 60 * 60)) / (60 * 60)), // Hours
        m: Math.floor((seconds % (60 * 60)) / 60), // Minutes
        s: Math.floor(seconds % 60), // Seconds
    };

    return Object.entries(timeUnits)
        .filter(([_, value]) => value > 0) // Filter out units with 0 value
        .map(([unit, value]) => `${value}${unit}`) // Format the remaining units
        .join(" "); // Join them with a space
}

export function formatNumberWithCommas(num: number): string {
    if (num < 1000) {
        return num.toString(); // Return the number as-is if less than 1,000
    }
    return num.toLocaleString('en-US'); // Automatically formats with commas
}

export function getTotalBalanceBNF(balanceObj: DittoBalanceBN): bigint {
    return BigInt(balanceObj.accumulatedBalance) + BigInt(balanceObj.liveBalance);
}

export function getTotalFormattedBalance(balanceObj: DittoBalanceBN): number {
    const total = BigInt(balanceObj.accumulatedBalance) + BigInt(balanceObj.liveBalance);
    console.log(formatUnits(total, DITTO_DECIMALS));
    return parseFloat(formatUnits(total, DITTO_DECIMALS));
}

export function getDeductionPayloadToDevFunds(
    userId: string,
    balance: DittoBalanceBN,
    valueToDeduct: bigint,
    notes?: string
): { sender: string; updates: UserBalanceUpdate[] } {

    if (valueToDeduct > balance.liveBalance + balance.accumulatedBalance) {
        throw new Error(`Insufficient funds for ${userId}.`);
    }

    const fromAccumulated = valueToDeduct <= balance.accumulatedBalance ? valueToDeduct : balance.accumulatedBalance;
    const fromLive = valueToDeduct - fromAccumulated;

    return {
        sender: userId,
        updates: [
            {
                userId,
                liveBalanceChange: (-fromLive).toString(),
                accumulatedBalanceChange: (-fromAccumulated).toString(),
                notes: notes || "Deducted from user balance",
            },
            {
                userId: DEVELOPMENT_FUNDS_KEY,
                liveBalanceChange: (fromLive + fromAccumulated).toString(),
                accumulatedBalanceChange: "0",
                notes: notes || `Credited from ${userId}`,
            }
        ]
    };
}

export function removeUndefined<T extends object>(obj: Partial<T>): Partial<T> {
    const result: Partial<T> = {};

    for (const key in obj) {
        if (obj[key] !== undefined) {
            result[key] = obj[key];
        }
    }

    return result;
}

export function toRoman(num: number): string {
    if (num <= 0 || num >= 4000) throw new Error("Number out of range (1–3999)");

    const romanMap: [number, string][] = [
        [1000, 'M'],
        [900, 'CM'],
        [500, 'D'],
        [400, 'CD'],
        [100, 'C'],
        [90, 'XC'],
        [50, 'L'],
        [40, 'XL'],
        [10, 'X'],
        [9, 'IX'],
        [5, 'V'],
        [4, 'IV'],
        [1, 'I'],
    ];

    let result = '';

    for (const [value, numeral] of romanMap) {
        while (num >= value) {
            result += numeral;
            num -= value;
        }
    }

    return result;
}

export function formatMaxDigits(value: number, maxDigits: number = 6): string {
    const suffixes = ["", "k", "m", "b", "t"];
    const absValue = Math.abs(value);

    // Count digits excluding dots and commas
    const digitCount = value
        .toLocaleString("en-US", { maximumFractionDigits: 20 })
        .replace(/[^0-9]/g, "").length;

    if (digitCount <= maxDigits) {
        return value.toLocaleString("en-US");
    }

    let suffixIndex = 0;
    let compactValue = absValue;

    while (compactValue >= 1000 && suffixIndex < suffixes.length - 1) {
        compactValue /= 1000;
        suffixIndex++;
    }

    // Try to find a clean representation that fits maxDigits
    let result = "";
    for (let decimals = maxDigits; decimals >= 0; decimals--) {
        const formatted = compactValue.toFixed(decimals);
        const noDotLength = formatted.replace(".", "").replace(/0+$/, "").length;

        if (noDotLength <= maxDigits) {
            // Remove trailing zeros and trailing dot
            result = formatted.replace(/\.?0+$/, "");
            break;
        }
    }

    if (value < 0) result = "-" + result;

    return `${result}${suffixes[suffixIndex]}`;
}

type AggregatedMods = {
    add: number;
    mul: number;
};

export type AggregatedStatEffects = {
    maxHp: AggregatedMods;
    atkSpd: AggregatedMods;
    acc: AggregatedMods;
    eva: AggregatedMods;
    maxMeleeDmg: AggregatedMods;
    maxRangedDmg: AggregatedMods;
    maxMagicDmg: AggregatedMods;
    critChance: AggregatedMods;
    critMultiplier: AggregatedMods;
    dmgReduction: AggregatedMods;
    magicDmgReduction: AggregatedMods;
    hpRegenRate: AggregatedMods;
    hpRegenAmount: AggregatedMods;

    meleeFactor: number;
    rangeFactor: number;
    magicFactor: number;
    reinforceAir: number;
    reinforceWater: number;
    reinforceEarth: number;
    reinforceFire: number;

    efficiencySkillIntervalMod: number;
    efficiencyDoubleResourceMod: number;
    efficiencyDoubleSkillExpMod: number;
    efficiencyDoubleCombatExpMod: number;
    efficiencyFlatSkillExpMod: number;
    efficiencyFlatCombatExpMod: number;
};

export function aggregateStatEffects(effects: (StatEffect | undefined | null)[]): AggregatedStatEffects {
    const result: AggregatedStatEffects = {
        maxHp: { add: 0, mul: 1 },
        atkSpd: { add: 0, mul: 1 },
        acc: { add: 0, mul: 1 },
        eva: { add: 0, mul: 1 },
        maxMeleeDmg: { add: 0, mul: 1 },
        maxRangedDmg: { add: 0, mul: 1 },
        maxMagicDmg: { add: 0, mul: 1 },
        critChance: { add: 0, mul: 1 },
        critMultiplier: { add: 0, mul: 1 },
        dmgReduction: { add: 0, mul: 1 },
        magicDmgReduction: { add: 0, mul: 1 },
        hpRegenRate: { add: 0, mul: 1 },
        hpRegenAmount: { add: 0, mul: 1 },

        meleeFactor: 0,
        rangeFactor: 0,
        magicFactor: 0,
        reinforceAir: 0,
        reinforceWater: 0,
        reinforceEarth: 0,
        reinforceFire: 0,

        efficiencySkillIntervalMod: 0,
        efficiencyDoubleResourceMod: 0,
        efficiencyDoubleSkillExpMod: 0,
        efficiencyDoubleCombatExpMod: 0,
        efficiencyFlatSkillExpMod: 0,
        efficiencyFlatCombatExpMod: 0
    };

    // helper for fields that use AggregatedMods
    function applyMod<K extends keyof AggregatedStatEffects>(
        key: K,
        mod: number | null | undefined,
        effect: 'add' | 'mul' | null | undefined
    ) {
        if (mod == null || effect == null) return;

        // only apply for fields that are AggregatedMods
        const target = result[key] as AggregatedMods;
        if (effect === 'add') target.add += mod;
        if (effect === 'mul') target.mul *= mod;
    }

    for (const e of effects) {
        if (!e) continue;

        applyMod('maxHp', e.maxHpMod, e.maxHpEffect);
        applyMod('atkSpd', e.atkSpdMod, e.atkSpdEffect);
        applyMod('acc', e.accMod, e.accEffect);
        applyMod('eva', e.evaMod, e.evaEffect);
        applyMod('maxMeleeDmg', e.maxMeleeDmgMod, e.maxMeleeDmgEffect);
        applyMod('maxRangedDmg', e.maxRangedDmgMod, e.maxRangedDmgEffect);
        applyMod('maxMagicDmg', e.maxMagicDmgMod, e.maxMagicDmgEffect);
        applyMod('critChance', e.critChanceMod, e.critChanceEffect);
        applyMod('critMultiplier', e.critMultiplierMod, e.critMultiplierEffect);
        applyMod('dmgReduction', e.dmgReductionMod, e.dmgReductionEffect);
        applyMod('magicDmgReduction', e.magicDmgReductionMod, e.magicDmgReductionEffect);
        applyMod('hpRegenRate', e.hpRegenRateMod, e.hpRegenRateEffect);
        applyMod('hpRegenAmount', e.hpRegenAmountMod, e.hpRegenAmountEffect);

        // additive-only fields
        result.meleeFactor += e.meleeFactor ?? 0;
        result.rangeFactor += e.rangeFactor ?? 0;
        result.magicFactor += e.magicFactor ?? 0;
        result.reinforceAir += e.reinforceAir ?? 0;
        result.reinforceWater += e.reinforceWater ?? 0;
        result.reinforceEarth += e.reinforceEarth ?? 0;
        result.reinforceFire += e.reinforceFire ?? 0;

        result.efficiencySkillIntervalMod += e.efficiencySkillIntervalMod ?? 0;
        result.efficiencyDoubleResourceMod += e.efficiencyDoubleResourceMod ?? 0;
        result.efficiencyDoubleSkillExpMod += e.efficiencyDoubleSkillExpMod ?? 0;
        result.efficiencyDoubleCombatExpMod += e.efficiencyDoubleCombatExpMod ?? 0;
        result.efficiencyFlatSkillExpMod += e.efficiencyFlatSkillExpMod ?? 0;
        result.efficiencyFlatCombatExpMod += e.efficiencyFlatCombatExpMod ?? 0;
    }

    return result;
}