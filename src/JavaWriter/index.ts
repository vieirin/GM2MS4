import { APITask } from './ApiTask'
import { Transitions } from './Transitions'

export class JavaWriter {
    protected transitions: Transitions
    protected tasks: APITask

    /**
     *
     */
    constructor(component: string) {
        this.tasks = new APITask()
        this.transitions = new Transitions(component, this.tasks.getClassName())
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
