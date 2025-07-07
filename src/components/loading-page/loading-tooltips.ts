const tooltips = ["Combat and Earn!", "Average User Earns $2 Weekly!", "700 USDT Distributed This Week!"]

export const getRandomTooltip = () => {
    return tooltips[Math.floor(Math.random() * tooltips.length)];
}