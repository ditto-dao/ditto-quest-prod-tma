import { formatUnits } from "ethers";
import { DittoBalanceBN, Rarity, SlimeWithTraits, UserBalanceUpdate } from "./types";
import { DEVELOPMENT_FUNDS_KEY, DITTO_DECIMALS } from "./config";

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
        // If the number is less than 1000, return it with 2 decimal places
        return value.toFixed(2);
    }

    const suffixes = ["", "k", "m", "b"];
    let suffixIndex = 0;

    // Divide the number by 1000 iteratively to determine the suffix
    while (value >= 1000 && suffixIndex < suffixes.length - 1) {
        value /= 1000;
        suffixIndex++;
    }

    // Format the value to 4 significant digits (including decimals)
    const formattedValue = value.toFixed(value < 10 ? 3 : value < 100 ? 2 : 1);

    return `${formattedValue}${suffixes[suffixIndex]}`;
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