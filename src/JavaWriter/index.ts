import { APITask } from './ApiTask'
import { APITransitions } from './ApiTransitions'

export class JavaWriter {
    protected transitions: APITransitions
    protected tasks: APITask

    /**
     *
     */
    constructor(component: string) {
        this.tasks = new APITask()
        this.transitions = new APITransitions(
            component,
            this.tasks.getClassName()
        )
    }

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
