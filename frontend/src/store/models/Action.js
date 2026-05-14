export class Action {
    constructor(data = {}) {
        this.reaction = data.reaction
        this.healthModification = data.health.modification
        this.requiredRollOfDice = data.required_roll_of_dice !== null
            ? new RequiredRollOfDice(data.required_roll_of_dice)
            : null
        this.isFinal = data.is_final
        this.isVictory = data.is_victory
        this.error = data.error || null
        this.battle = new Battle(data.battle)
    }
}

export class RequiredRollOfDice {
    constructor(data) {
        this.cube = data.cube
        this.stat = data.stat
        this.complexity = data.complexity
        this.gamerId = data.gamer_id
    }
}

export class Battle {
    constructor(data) {
        this.isActive = data.is_active
        this.enemies = []
        if (this.isActive) {
            for (let i = 0; i < data.enemies.length; i++) {
                this.enemies.push(new Enemies(data.enemies[i]))
            }
        }
    }
}

export class Enemies {
    constructor(data) {
        this.name = data.name
        this.health = data.health
        this.maxHealth = data.max_health
        this.armor = data.armor
    }
}
