'use strict';

const GUESS_NO = 0;
const GUESS_ROCK = 1;
const GUESS_PAPER = 2;
const GUESS_SCISSORS = 3;

const BUY_BOTNET = 0;
const BUY_HACKER = 1;
const BUY_FIREWALL = 2;
const BUY_SERVER = 3;
const BUY_PROXY = 4;
const BUY_MINE = 5;
const END_TURN = 6;

class Store {}

/**
 * A botnet.
 */
class BotNet {
    constructor() {
        this.hosts = 0;
    }

    getHostCount() {
        return this.hosts;
    }

    upgrade() {
        this.hosts++;
    }
}

/**
 * Your webserver.
 */
class Server {
    constructor() {
        this.level = 0;
    }

    getUpgradeLevel() {
        return this.level;
    }

    upgrade() {
        this.level++;
    }
}
