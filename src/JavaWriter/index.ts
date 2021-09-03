import { APITask } from './ApiTask'
import { APITransitions } from './ApiTranstions'

export class JavaWriter {
    protected transitions = new APITransitions()
    protected tasks = new APITask()

    /**
     *
     */
    constructor() {}

    writeTaskMethods(tasks: string[]) {
        tasks.forEach((task) => {
            this.tasks.createTaskMethod(task)
        })
    }

    print() {
        console.log(this.tasks.print(), this.transitions.print())
    }
}
