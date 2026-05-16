export class Game {
    constructor(data = {}) {
        this.id = data.id || null
        this.name = data.name || ''
        this.countGamer = data.count_gamer || data.countGamer || 0
        this.context = data.context || ''
        this.gamerIds = data.gamer_ids || []
        this.goal = data.goal || ''
        this.startMess = ''
    }

    addStartMess(data) {
        this.startMess = data.action
    }

    addBriefRetelling(data) {
        this.startMess = data
    }
}