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

class Points {
    constructor() {
        this.income = 3;
        this.money = 3;
        this.power = 0;
        this.security = 0;
        this.availablity = 3;
    }
}

/**
 * Store to purchase upgrades.
 */
class Store {}
