import {
    taskVarName,
    transitionClassName,
    transitionMethodName
} from '../ms4Builder/naming'
import { func, RunnerDecomposition } from '../ObjectiveTree/treeNavigation'
import { Class } from './Class'
import { Java } from './constants'
import {
    adapterRunnerInterface,
    writeRefinedTask,
    writeRunner,
    writeTaskRunner
} from './helpers'

export class Transitions extends Class {
    taskClassVarName: string
    component: string
    /**
     *
     */
    constructor(component: string, tasksClassName: string) {
        super(`${transitionClassName(component)}`, Java.RESULT_CLASS)

        this.taskClassVarName = taskVarName(component)
        this.component = component

        this.writeContent(adapterRunnerInterface())
        this.addProperty(this.taskClassVarName, tasksClassName, '')
        this.addProperty(Java.RESULT_VAR, Java.RESULT_CLASS, '')
        this.writeContent(writeTaskRunner())
    }

    hasNodeWithChildren = (functions: func[]) => functions.length > 0

    isStateARunner = (fns: func[]) =>
        fns.reduce((prev, curr) => prev + (curr.refiner ? 1 : 0), 0)

    getTransitionsRecursively = ({
        fromState,
        component,
        functions,
        nodeType,
        relation,
        nextLevel
    }: RunnerDecomposition): string =>
        (nodeType === 'refiner'
            ? writeRefinedTask(
                  fromState,
                  functions.map((fn) => fn.name)
              )
            : component === this.component
            ? writeRunner(
                  fromState,
                  this.hasNodeWithChildren(functions)
                      ? functions.map((fn) => fn.name)
                      : nextLevel.map((item) =>
                            transitionMethodName(item.fromState)
                        ),
                  relation,
                  nextLevel?.[0]?.fromState || '',
                  this.hasNodeWithChildren(functions)
                      ? this.taskClassVarName
                      : undefined
              )
            : '') +
        nextLevel
            .map((level) => this.getTransitionsRecursively(level))
            .join('\n')

    writeTransitionMethods = (decomposition: RunnerDecomposition) => {
        this.writeContent(this.getTransitionsRecursively(decomposition))
    }
}
