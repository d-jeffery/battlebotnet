'use strict';
let GUESS_NO = 0,
    GUESS_ROCK = 1,
    GUESS_PAPER = 2,
    GUESS_SCISSORS = 3,
    BUY_BOTNET = 0,
    BUY_HACKER = 1,
    BUY_FIREWALL = 2,
    BUY_SERVER = 3,
    BUY_PROXY = 4,
    BUY_MINE = 5,
    END_TURN = 6,
    PROXY_NONE = 0,
    PROXY_BASIC = 1,
    PROXY_ENTERPRISE = 2,
    store = {
        purchase(e, r) {
            if (this.canBuy(e, r)) {
                r.points.money -= this.getPrice(e, r.purchases);
                switch (e) {
                    case BUY_BOTNET:
                        r.purchases.botnetLevel++;
                        break;
                    case BUY_HACKER:
                        r.purchases.hackers.push(3);
                        break;
                    case BUY_FIREWALL:
                        r.purchases.fireWall = !0;
                        break;
                    case BUY_SERVER:
                        r.purchases.serverLevel++;
                        break;
                    case BUY_PROXY:
                        r.purchases.proxy++;
                        break;
                    case BUY_MINE:
                        r.purchases.mineLevel++;
                        break;
                    default:
                        break;
                }
            }
        },
        canBuy(e, r) {
            let s = this.getPrice(e, r.purchases) <= r.points.money;
            switch (e) {
                case BUY_FIREWALL:
                    return !r.purchases.fireWall && s;
                case BUY_PROXY:
                    if (r.purchases.proxy === PROXY_ENTERPRISE) return !1;
                    return s;
                default:
                    return s;
            }
        },
        getPrice(e, r) {
            switch (e) {
                case BUY_BOTNET:
                    if (r.botnetLevel === 0) {
                        return 3;
                    } else {
                        return 2;
                    }
                case BUY_HACKER:
                    return 5;
                case BUY_FIREWALL:
                    return 1;
                case BUY_SERVER:
                    return 2 + r.serverLevel;
                case BUY_PROXY:
                    if (r.proxy === PROXY_NONE) return 2;
                    return 3;
                case BUY_MINE:
                    return 3;
                default:
                    return Number.MAX_SAFE_INTEGER;
            }
        }
    };
