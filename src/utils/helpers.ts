import { Rarity, SlimeWithTraits } from "./types";

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getChildTraitProbabilities(sire: SlimeWithTraits, dame: SlimeWithTraits) {
    const traitTypes = ["Aura", "Body", "Headpiece", "Tail", "Arms", "Eyes", "Mouth"] as const;
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
        slime.AuraDominant,
        slime.BodyDominant,
        slime.CoreDominant,
        slime.HeadpieceDominant,
        slime.TailDominant,
        slime.ArmsDominant,
        slime.EyesDominant,
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