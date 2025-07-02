import rawSlimeTraits from "../../../assets/json/slime-traits.json";
import { SlimeTrait } from "../../../utils/types";

const slimeTraitsArray: SlimeTrait[] = rawSlimeTraits as SlimeTrait[];

const slimeTraitMap: Record<number, SlimeTrait> = slimeTraitsArray.reduce(
    (acc, trait) => {
        acc[trait.id] = trait;
        return acc;
    },
    {} as Record<number, SlimeTrait>
);

export { slimeTraitsArray, slimeTraitMap };