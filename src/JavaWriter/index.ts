import { runnerDecomposition } from '../ObjectiveTree/treeNavigation'
import { ObjectiveTree } from '../ObjectiveTree/types'
import { APITask } from './ApiTask'
import { Transitions } from './Transitions'

export class JavaWriter {
    protected transitions: Transitions
    protected tasks: APITask
    protected component: string
    /**
     *
     */
    constructor(component: string) {
        this.tasks = new APITask(component + 'TaskClass')
        this.transitions = new Transitions(component, this.tasks.getClassName())
        this.component = component
    }

    writeTaskMethods = (tasks: string[]) => {
        tasks.forEach((task) => {
            this.tasks.createTaskMethod(task)
        })
    }

    writeTransitionsMethods = (tree: ObjectiveTree) => {
        const decomposition = runnerDecomposition(tree, this.component)
        this.transitions.writeTransitionMethods(decomposition)
    }

    getTransitionClassName = () => this.transitions.getClassName()

    close = () => {
        this.transitions.close()
        this.tasks.close()
    }

    print() {
        console.log(this.tasks.print(), this.transitions.print())
    }
}
