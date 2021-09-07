import { runnerDecomposition } from '../ObjectiveTree/treeNavigation'
import { ObjectiveTree } from '../ObjectiveTree/types'
import { APITask } from './ApiTask'
import { writeRunner } from './helpers'
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

    writeTransitionsMethods = (tree: ObjectiveTree) => {
        const decomposotion = runnerDecomposition(tree)
        console.log(
            writeRunner(decomposotion.fromState, decomposotion.functions)
        )
    }

    getTransitionClassName = () => this.transitions.getClassName()

    print() {
        console.log(this.tasks.print(), this.transitions.print())
    }
}
