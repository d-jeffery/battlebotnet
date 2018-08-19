'use strict';
let BUY_SERVER = 0,
    BUY_PROXY = 1,
    BUY_MINE = 2,
    BUY_BOTNET = 3,
    BUY_HACKER = 4,
    END_TURN = 5,
    PROXY_NONE = 0,
    PROXY_BASIC = 1,
    PROXY_ENTERPRISE = 2,
    store = {
        purchase(e, r) {
            if (this.canBuy(e, r)) {
                r.points.money -= this.getPrice(e, r.purchases);
                switch (e) {
                    case BUY_SERVER:
                        r.purchases.serverLevel++;
                        break;
                    case BUY_PROXY:
                        r.purchases.proxy++;
                        break;
                    case BUY_MINE:
                        r.purchases.mineLevel++;
                        break;
                    case BUY_BOTNET:
                        r.purchases.botnetLevel++;
                        break;
                    case BUY_HACKER:
                        r.purchases.hackers.push(3);
                        break;
                    default:
                        break;
                }
            }
        },
        canBuy(e, r) {
            let s = this.getPrice(e, r.purchases) <= r.points.money;
            switch (e) {
                case BUY_PROXY:
                    if (r.purchases.proxy === PROXY_ENTERPRISE) return !1;
                    return s;
                default:
                    return s;
            }
        },
        getPrice(e, r) {
            switch (e) {
                case BUY_SERVER:
                    return 1 + r.serverLevel;
                case BUY_PROXY:
                    if (r.proxy === PROXY_NONE) return 1;
                    return 2;
                case BUY_MINE:
                    return 3;
                case BUY_BOTNET:
                    return 2;
                case BUY_HACKER:
                    return 4;
                default:
                    return Number.MAX_SAFE_INTEGER;
            }
        }
    };
