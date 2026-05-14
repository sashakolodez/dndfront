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