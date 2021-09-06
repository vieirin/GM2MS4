import { APITask } from './ApiTask'
import { APITransitions } from './ApiTransitions'

export class JavaWriter {
    protected transitions = new APITransitions()
    protected tasks = new APITask()

    /**
     *
     */
    constructor() {}

    writeTaskMethods = (tasks: string[]) => {
        tasks.forEach((task) => {
            this.tasks.createTaskMethod(task)
        })
    }

    getTransitionClassName = () => this.transitions.getClassName()

    print() {
        console.log(this.tasks.print(), this.transitions.print())
    }
}
