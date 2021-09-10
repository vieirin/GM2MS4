import { taskVarName, transitionClassName } from '../ms4Builder/naming'
import { RunnerDecomposition } from '../ObjectiveTree/treeNavigation'
import { Class } from './Class'
import { Java } from './constants'
import { adapterRunnerInterface, writeRunner, writeTaskRunner } from './helpers'

export class Transitions extends Class {
    taskClassVarName: string

    /**
     *
     */
    constructor(component: string, tasksClassName: string) {
        super(`${transitionClassName(component)}`, Java.RESULT_CLASS)

        this.taskClassVarName = taskVarName(component)
        this.writeContent(adapterRunnerInterface())
        this.addProperty(this.taskClassVarName, tasksClassName, '')
        this.addProperty(Java.RESULT_VAR, Java.RESULT_CLASS, '')
        this.writeContent(writeTaskRunner())
    }

    getTransitionsRecursively = ({
        fromState,
        functions,
        relation,
        nextLevel
    }: RunnerDecomposition): string =>
        writeRunner(
            this.taskClassVarName,
            fromState,
            functions,
            relation,
            nextLevel?.[0]?.fromState || ''
        ) +
        nextLevel
            .map((level) => this.getTransitionsRecursively(level))
            .join('\n')

    writeTransitionMethods = (decomposition: RunnerDecomposition) => {
        this.writeContent(this.getTransitionsRecursively(decomposition))
    }
}
