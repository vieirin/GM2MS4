import { inputFiles } from '../ms4Builder/createMS4Project.js'
import { runnerDecomposition } from '../ObjectiveTree/treeNavigation.js'
import { ObjectiveTree } from '../ObjectiveTree/types.js'
import { APITask } from './ApiTask.js'
import { Transitions } from './Transitions.js'

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

    close = (): [inputFiles, inputFiles] => [
        this.transitions.close(),
        this.tasks.close()
    ]

    print() {
        console.log(this.tasks.print(), this.transitions.print())
    }
}
