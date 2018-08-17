// @flow
'use strict';

const GUESS_NO = 0;
const GUESS_ROCK = 1;
const GUESS_PAPER = 2;
const GUESS_SCISSORS = 3;

// Purchase enum
const BUY_BOTNET = 0;
const BUY_HACKER = 1;
const BUY_FIREWALL = 2;
const BUY_SERVER = 3;
const BUY_PROXY = 4;
const BUY_MINE = 5;
const END_TURN = 6;

// Proxy enum
const PROXY_NONE = 0;
const PROXY_BASIC = 1;
const PROXY_ENTERPRISE = 2;

/**
 * Store to purchase upgrades.
 */
const store = {
    /**
     * Make a purchase
     * @param {number} option
     * @param {State} state
     */
    purchase(option, state) {
        if (this.canBuy(option, state)) {
            state.points.money -= this.getPrice(option, state.purchases);
            switch (option) {
                case BUY_BOTNET:
                    state.purchases.botnetLevel++;
                    break;
                case BUY_HACKER:
                    state.purchases.hackers.push(3);
                    break;
                case BUY_FIREWALL:
                    state.purchases.fireWall = true;
                    break;
                case BUY_SERVER:
                    state.purchases.serverLevel++;
                    break;
                case BUY_PROXY:
                    state.purchases.proxy++;
                    break;
                case BUY_MINE:
                    state.purchases.mineLevel++;
                    break;
                default:
                    break;
            }
        }
    },

    /**
     * Get price of item.
     * @param option
     * @param {State} state
     * @returns {boolean}
     */
    canBuy(option, state) {
        const canAfford = this.getPrice(option, state.purchases) <= state.points.money;

        switch (option) {
            case BUY_FIREWALL:
                return !state.purchases.fireWall && canAfford;
            case BUY_PROXY:
                if (state.purchases.proxy === PROXY_ENTERPRISE) return false;
                return canAfford;
            default:
                return canAfford;
        }
    },

    /**
     * Get price of item.
     * @param option
     * @param {Purchases} purchases
     * @returns {number}
     */
    getPrice(option, purchases) {
        switch (option) {
            case BUY_BOTNET:
                if (purchases.botnetLevel === 0) {
                    return 3;
                } else {
                    return 2;
                }
            case BUY_HACKER:
                return 5;
            case BUY_FIREWALL:
                return 1;
            case BUY_SERVER:
                return 2 + purchases.serverLevel;
            case BUY_PROXY:
                if (purchases.proxy === PROXY_NONE) return 2;
                return 3;
            case BUY_MINE:
                return 3;
            default:
                return Number.MAX_SAFE_INTEGER;
        }
    }
};
