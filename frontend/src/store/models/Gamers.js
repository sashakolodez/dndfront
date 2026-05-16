export class GamerCollection {
    constructor() {
        this.gamers = []
    }
    addGamers(data) {
        for (let i = 0; i < data.length; i++) {
            this.gamers.push(new Gamers(data[i]))
        }
    }

    addGamer(gamer) {
        this.gamers.push(gamer)
    }
}
export class Gamers {
    constructor(data = {}) {
        this.id = data.id || null
        this.name = data.name || ''
        this.isInit = data.is_init
        this.class = data.class || null
        this.description = data.description || ''
        this.stats = new Stats(data.stats) || []
        this.health = data.health
        this.maxHealth = data.max_health || 0
        this.armor = data.armor || 0
        this.spellSlots = data.spell_slots
        this.spells = []
        if (data.spells && Array.isArray(data.spells) && data.spells !== []) {
            for (let i = 0; i < data.spells.length; i++) {
                this.spells.push(new Spell(data.spells[i]))
            }
        }
        this.correction = data.correction || null
        this.inventory = []
        if (data.inventory && Array.isArray(data.inventory)) {
            for (let i = 0; i < data.inventory.length; i++) {
                this.inventory.push(new Inventory(data.inventory[i]))
            }
        }
    }

    setHealthData(data) {
        this.health = data.current
        this.maxHealth = data.max
    }
}

export class Stats {
    constructor(stats = {}) {
        this.strength = stats.strength || 0
        this.dexterity = stats.dexterity || 0
        this.constitution = stats.constitution || 0
        this.intelligence = stats.intelligence || 0
        this.wisdom = stats.wisdom || 0
        this.charisma = stats.charisma || 0

    }
}

export class Inventory {
    constructor(data= {}) {
        this.id = data.id
        this.title = data.title
        this.description = data.description
    }
}

export class Health {
    constructor(data) {
        this.modification = data.modification || null
        this.current = data.current || 0
        this.max = data.max
    }
}

export class Spell {
    constructor(data) {
        this.id = data.id
        this.title = data.title
        this.description = data.description
        this.level = data.level
    }
}

export class SpellSlots {
    constructor(data) {
        this.one = data.one || []
        this.two = data.two || []
        this.three = data.three || []
        this.four = data.four || []
    }
}
