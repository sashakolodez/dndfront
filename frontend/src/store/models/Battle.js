// src/store/models/Battle.js

export class BattleInit {
    constructor(data = {}) {
        this.rollDices = []
        if (data.roll_dices && Array.isArray(data.roll_dices)) {
            for (let i = 0; i < data.roll_dices.length; i++) {
                this.rollDices.push(new RollDice(data.roll_dices[i]))
            }
        }
    }
}

export class RollDice {
    constructor(data = {}) {
        this.name = data.name || ''
        this.id = data.id || null
        this.unitType = data.unit_type || ''
        this.rollDice = data.roll_dice || 0
        this.bonus = data.bonus || 0
        this.bonusStat = data.bonus_stat || ''
    }
}

export class NPCAction {
    constructor(data = {}) {
        this.action = data.action || null
        this.damage = data.damage || 0
        this.gamerId = data.gamer_id || null
    }
}