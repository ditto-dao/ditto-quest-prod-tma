import { formatUnits } from "ethers";
import { Combat, DittoBalanceBN, Inventory, Rarity, SlimeWithTraits, StatEffect, User, UserBalanceUpdate } from "./types";
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

export function getHighestDominantTraitRarity(slime: SlimeWithTraits): Rarity {
    // Map rarity values to a rank for comparison
    const rarityRank: Record<Rarity, number> = {
        [Rarity.S]: 5,
        [Rarity.A]: 4,
        [Rarity.B]: 3,
        [Rarity.C]: 2,
        [Rarity.D]: 1,
    };

    // Collect all dominant traits
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

    // Find the highest rarity among the dominant traits
    const highestRarity = dominantTraits.reduce<Rarity>((highest, trait) => {
        return rarityRank[trait.rarity] > rarityRank[highest] ? trait.rarity : highest;
    }, Rarity.D); // Start with the lowest rarity as the initial value

    return highestRarity;
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

function calculateNetStatDelta(user: User, effects: StatEffect[]) {
    const base = {
        maxHp: user.maxHp, atkSpd: user.atkSpd, acc: user.acc, eva: user.eva,
        maxMeleeDmg: user.maxMeleeDmg, maxRangedDmg: user.maxRangedDmg, maxMagicDmg: user.maxMagicDmg,
        critChance: user.critChance, critMultiplier: user.critMultiplier,
        dmgReduction: user.dmgReduction, magicDmgReduction: user.magicDmgReduction,
        hpRegenRate: user.hpRegenRate, hpRegenAmount: user.hpRegenAmount,
    };

    const result = {
        maxHp: 0, atkSpd: 0, acc: 0, eva: 0, maxMeleeDmg: 0, maxRangedDmg: 0, maxMagicDmg: 0,
        critChance: 0, critMultiplier: 0, dmgReduction: 0, magicDmgReduction: 0,
        hpRegenRate: 0, hpRegenAmount: 0, meleeFactor: 0, rangeFactor: 0, magicFactor: 0,
        reinforceAir: 0, reinforceWater: 0, reinforceEarth: 0, reinforceFire: 0,
        doubleResourceOdds: 0, skillIntervalReductionMultiplier: 0,
    };

    const additive = {} as Record<keyof typeof base, number>;
    const multiplicative = {} as Record<keyof typeof base, number[]>;

    // Init base keys
    for (const key of Object.keys(base) as (keyof typeof base)[]) {
        additive[key] = 0;
        multiplicative[key] = [];
    }

    const apply = (mod: number | null | undefined, effect: 'add' | 'mul' | null | undefined, key: keyof typeof base) => {
        if (mod == null || effect == null) return;
        if (effect === 'add') additive[key] += mod;
        else multiplicative[key].push(mod); // expects full multiplier value like 0.9 or 1.1
    };

    for (const e of effects) {
        apply(e.maxHpMod, e.maxHpEffect, 'maxHp');
        apply(e.atkSpdMod, e.atkSpdEffect, 'atkSpd');
        apply(e.accMod, e.accEffect, 'acc');
        apply(e.evaMod, e.evaEffect, 'eva');
        apply(e.maxMeleeDmgMod, e.maxMeleeDmgEffect, 'maxMeleeDmg');
        apply(e.maxRangedDmgMod, e.maxRangedDmgEffect, 'maxRangedDmg');
        apply(e.maxMagicDmgMod, e.maxMagicDmgEffect, 'maxMagicDmg');
        apply(e.critChanceMod, e.critChanceEffect, 'critChance');
        apply(e.critMultiplierMod, e.critMultiplierEffect, 'critMultiplier');
        apply(e.dmgReductionMod, e.dmgReductionEffect, 'dmgReduction');
        apply(e.magicDmgReductionMod, e.magicDmgReductionEffect, 'magicDmgReduction');
        apply(e.hpRegenRateMod, e.hpRegenRateEffect, 'hpRegenRate');
        apply(e.hpRegenAmountMod, e.hpRegenAmountEffect, 'hpRegenAmount');

        // Simple additive values
        result.meleeFactor += e.meleeFactor ?? 0;
        result.rangeFactor += e.rangeFactor ?? 0;
        result.magicFactor += e.magicFactor ?? 0;
        result.reinforceAir += e.reinforceAir ?? 0;
        result.reinforceWater += e.reinforceWater ?? 0;
        result.reinforceEarth += e.reinforceEarth ?? 0;
        result.reinforceFire += e.reinforceFire ?? 0;

        result.doubleResourceOdds += e.doubleResourceOddsMod ?? 0;
        result.skillIntervalReductionMultiplier += e.skillIntervalReductionMultiplierMod ?? 0;
    }

    // Apply all stats with additive then multiplicative chaining
    for (const key of Object.keys(base) as (keyof typeof base)[]) {
        const baseVal = base[key];
        const add = additive[key];
        const mulChain = multiplicative[key].reduce((acc, val) => acc * val, 1);
        result[key] = (baseVal + add) * mulChain - baseVal;
    }

    return result;
}

function applyDelta(user: User, combat: Combat, delta: ReturnType<typeof calculateNetStatDelta>) {
    user.doubleResourceOdds += delta.doubleResourceOdds;
    user.skillIntervalReductionMultiplier += delta.skillIntervalReductionMultiplier;

    combat.maxHp = Math.round(combat.maxHp + delta.maxHp);
    combat.atkSpd = Math.round(combat.atkSpd + delta.atkSpd);
    combat.acc = Math.round(combat.acc + delta.acc);
    combat.eva = Math.round(combat.eva + delta.eva);
    combat.maxMeleeDmg = Math.round(combat.maxMeleeDmg + delta.maxMeleeDmg);
    combat.maxRangedDmg = Math.round(combat.maxRangedDmg + delta.maxRangedDmg);
    combat.maxMagicDmg = Math.round(combat.maxMagicDmg + delta.maxMagicDmg);
    combat.critChance += delta.critChance;
    const bonusCrit = Math.max(combat.critMultiplier - 1, 0.29);
    combat.critMultiplier = 1 + bonusCrit * (1 + delta.critMultiplier);
    combat.dmgReduction = Math.round(combat.dmgReduction + delta.dmgReduction);
    combat.magicDmgReduction = Math.round(combat.magicDmgReduction + delta.magicDmgReduction);
    combat.hpRegenRate += delta.hpRegenRate;
    combat.hpRegenAmount = Math.round(combat.hpRegenAmount + delta.hpRegenAmount);
    combat.meleeFactor = Math.round(combat.meleeFactor + delta.meleeFactor);
    combat.rangeFactor = Math.round(combat.rangeFactor + delta.rangeFactor);
    combat.magicFactor = Math.round(combat.magicFactor + delta.magicFactor);
    combat.reinforceAir = Math.round(combat.reinforceAir + delta.reinforceAir);
    combat.reinforceWater = Math.round(combat.reinforceWater + delta.reinforceWater);
    combat.reinforceEarth = Math.round(combat.reinforceEarth + delta.reinforceEarth);
    combat.reinforceFire = Math.round(combat.reinforceFire + delta.reinforceFire);
}

export function updateUserStatsFromEquipmentAndSlime(user: User, userCombat: Combat): void {
    const statEffects: StatEffect[] = [];

    const equippedItems: (Inventory | null | undefined)[] = [
        user.hat,
        user.armour,
        user.weapon,
        user.shield,
        user.cape,
        user.necklace,
    ];

    // ✅ Reset to base values first
    userCombat.hp = user.maxHp;
    userCombat.maxHp = user.maxHp;
    userCombat.atkSpd = user.atkSpd;
    userCombat.acc = user.acc;
    userCombat.eva = user.eva;
    userCombat.maxMeleeDmg = user.maxMeleeDmg;
    userCombat.maxRangedDmg = user.maxRangedDmg;
    userCombat.maxMagicDmg = user.maxMagicDmg;
    userCombat.critChance = user.critChance;
    userCombat.critMultiplier = user.critMultiplier;
    userCombat.dmgReduction = user.dmgReduction;
    userCombat.magicDmgReduction = user.magicDmgReduction;
    userCombat.hpRegenRate = user.hpRegenRate;
    userCombat.hpRegenAmount = user.hpRegenAmount;

    // ✅ Reset multipliers
    userCombat.meleeFactor = 0;
    userCombat.rangeFactor = 0;
    userCombat.magicFactor = 0;
    userCombat.reinforceAir = 0;
    userCombat.reinforceWater = 0;
    userCombat.reinforceEarth = 0;
    userCombat.reinforceFire = 0;

    let updatedAttackType = false;

    for (const item of equippedItems) {
        const effect = item?.equipment?.statEffect;
        if (effect) {
            statEffects.push(effect);
        } else if (item?.equipment) {
            console.error(`Equipment "${item.equipment.name}" (ID: ${item.equipment.id}) has no statEffect linked.`);
        }

        if (item?.equipment?.attackType && !updatedAttackType) {
            userCombat.attackType = item.equipment.attackType;
            updatedAttackType = true;
        }
    }

    if (!updatedAttackType) userCombat.attackType = 'Melee';

    // ✅ Add only DOMINANT slime traits
    if (user.equippedSlime) {
        const {
            BodyDominant,
            PatternDominant,
            PrimaryColourDominant,
            AccentDominant,
            DetailDominant,
            EyeColourDominant,
            EyeShapeDominant,
            MouthDominant,
        } = user.equippedSlime;

        const dominantTraits = [
            BodyDominant,
            PatternDominant,
            PrimaryColourDominant,
            AccentDominant,
            DetailDominant,
            EyeColourDominant,
            EyeShapeDominant,
            MouthDominant,
        ];

        for (const trait of dominantTraits) {
            if (trait?.statEffect) statEffects.push(trait.statEffect);
        }
    }

    const delta = calculateNetStatDelta(user, statEffects);
    applyDelta(user, userCombat, delta);

    userCombat.cp = calculateCombatPower(userCombat).toString();
}

export function calculateCombatPower(c: Combat): Decimal {
    const maxMeleeDmg = new Decimal(c.maxMeleeDmg);
    const maxRangedDmg = new Decimal(c.maxRangedDmg);
    const maxMagicDmg = new Decimal(c.maxMagicDmg);

    const atkSpd = new Decimal(c.atkSpd);
    const critChance = new Decimal(c.critChance);
    const critMultiplier = new Decimal(c.critMultiplier);
    const acc = new Decimal(c.acc);
    const eva = new Decimal(c.eva);
    const dmgReduction = new Decimal(c.dmgReduction);
    const magicDmgReduction = new Decimal(c.magicDmgReduction);
    const hpRegenRate = new Decimal(c.hpRegenRate);
    const hpRegenAmount = new Decimal(c.hpRegenAmount);
    const maxHp = new Decimal(c.maxHp);

    const relevantMaxDmg =
        c.attackType === "Melee" ? maxMeleeDmg :
            c.attackType === "Ranged" ? maxRangedDmg :
                c.attackType === "Magic" ? maxMagicDmg :
                    new Decimal(0);

    const critBonus = critChance.mul(critMultiplier.minus(1));
    const offenseScore = relevantMaxDmg
        .mul(new Decimal(1).plus(critBonus))
        .mul(new Decimal(1).plus(atkSpd.div(10)));

    const accuracyScore = acc.sqrt();
    const evasionScore = eva.sqrt();
    const defenseScore = dmgReduction.plus(magicDmgReduction);
    const sustainScore = hpRegenRate.mul(hpRegenAmount).mul(0.1);
    const hpScore = maxHp.sqrt();

    const totalScore = offenseScore.mul(12)
        .plus(accuracyScore.mul(5))
        .plus(evasionScore.mul(5))
        .plus(defenseScore.mul(4))
        .plus(sustainScore.mul(2))
        .plus(hpScore.mul(1.5));

    return totalScore.round(); // return as Decimal
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

export function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, _) => {
        if (!src) return resolve(); // resolve instantly if no src

        const img = new Image();
        img.onload = () => resolve(); // only mark as loaded when fully decoded
        img.onerror = () => {
            console.error(`Failed to preload image: ${src}`);
            resolve(); // still resolve to not block
        };
        img.src = src;
    });
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