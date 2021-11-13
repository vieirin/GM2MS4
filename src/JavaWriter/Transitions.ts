import {
    nameGoalContinuation,
    taskVarName,
    transitionClassName
} from '../ms4Builder/naming'
import { func, RunnerDecomposition } from '../ObjectiveTree/treeNavigation'
import { component } from '../ObjectiveTree/types'
import { Class } from './Class'
import {
    adapterRunnerInterface,
    writeRefinedTask,
    writeResultVerifier,
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
        super(`${transitionClassName(component)}`)

        this.taskClassVarName = taskVarName(component)
        this.component = component

        this.writeContent(adapterRunnerInterface())
        this.addProperty(this.taskClassVarName, tasksClassName, '')
        // this.addProperty(Java.RESULT_VAR, Java.RESULT_CLASS, `"${component}"`)
        this.writeContent(writeTaskRunner())
        this.writeContent(writeResultVerifier())
    }

    hasNodeWithChildren = (functions: func[]) => functions.length > 0

    isStateARunner = (fns: func[]) =>
        fns.reduce((prev, curr) => prev + (curr.refiner ? 1 : 0), 0)

    calcResultVerifier = () => {}

    getTransitionsRecursively = ({
        fromState,
        component,
        functions,
        parentRelation,
        nodeType,
        relation,
        nextLevel
    }: RunnerDecomposition): string => {
        const classComponent = this.component
        const sameComponent = (another: component) => classComponent === another
        return (
            (nodeType === 'refiner'
                ? writeRefinedTask(
                      fromState,
                      functions,
                      relation,
                      parentRelation,
                      this.taskClassVarName
                  )
                : sameComponent(component)
                ? writeRunner(
                      fromState,
                      functions,
                      parentRelation,
                      relation,
                      nextLevel?.[0]?.fromState || '',
                      this.hasNodeWithChildren(functions)
                          ? this.taskClassVarName
                          : undefined
                  )
                : writeRunner(fromState, [], relation, relation, '')) +
            nextLevel
                // let only the "_continue" to be written as runners
                // for that we clear all the children and functions from the components at the first level
                // that belongs to another component so that we have only a "return state" for that signal
                .map((goal) =>
                    goal.nodeType === 'goal'
                        ? {
                              ...goal,
                              fromState: !sameComponent(goal.component)
                                  ? nameGoalContinuation(goal.fromState)
                                  : goal.fromState,
                              component: classComponent,
                              functions: sameComponent(goal.component)
                                  ? goal.functions
                                  : [],
                              nextLevel: sameComponent(goal.component)
                                  ? goal.nextLevel
                                  : []
                          }
                        : goal
                )
                .filter((level) => sameComponent(level.component))
                .map((level) => this.getTransitionsRecursively(level))
                .join('\n')
        )
    }
    writeTransitionMethods = (decomposition: RunnerDecomposition) => {
        this.writeContent(this.getTransitionsRecursively(decomposition))
    }
}
