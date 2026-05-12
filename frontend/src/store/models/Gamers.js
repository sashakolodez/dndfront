export class Gamers {
    constructor(id = '', data = {}) {
        this.id = id || null
        this.name = data.name || ''
        this.class = data.class || null
        this.description = data.description || ''
        this.stats = new Stats(data.stats) || []
        this.inventory = []
        if (data.inventory && Array.isArray(data.inventory)) {
            for (let i = 0; i < data.inventory.length; i++) {
                this.inventory.push(new Inventory(data.inventory[i]))
            }
        }
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
