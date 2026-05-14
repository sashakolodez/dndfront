export class WorldCollection {
    constructor(data) {
        this.total = data.total
        if (data.data !== []) {
            for (let i = 0; i < data.data.length; i++) {
                this.worlds = new World(data.data[i])
            }
        }
    }

}

export class World {
    constructor(data) {
        this.id = data.id
        this.name = data.name
        this.context = data.context
        this.goal = data.goal
        this.countGamer = data.countGamer
        this.gamerIds = data.gamer_ids
    }
}