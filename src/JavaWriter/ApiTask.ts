import { Class } from './Class.js'

export class APITask extends Class {
    /**
     *
     */
    constructor(className: string) {
        super(className)
    }

    createTaskMethod(taskName: string) {
        this.writeMethodToClass('public', taskName)
    }
}
