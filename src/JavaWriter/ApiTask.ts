import { Class } from './Class'

export class APITask extends Class {
    /**
     *
     */
    constructor() {
        super('APITaskClass')
    }

    createTaskMethod(taskName: string) {
        this.writeMethodToClass('public', taskName)
    }
}
