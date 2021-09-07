import { Model } from '../GoalModel'
import { JavaWriter } from '../JavaWriter/index'
import {
    convertToTree,
    getNodes,
    getTreeNodeByComponent
} from '../ObjectiveTree'
import { branchGoals } from '../ObjectiveTree/treeNavigation'
import { ComponentData, LeveledGoalComponent } from '../ObjectiveTree/types'
import { nameTaskMethod } from './naming'
import { SequenceState } from './types'

const stateSequenceForInput = (
    component: string,
    inputNode: LeveledGoalComponent
): SequenceState => [inputNode, ...branchGoals(component, inputNode)]

export const generateWaitForInput = (
    moduleName: string,
    component: ComponentData
) => {
    const waitForInputGoals = component.goals.filter(
        (node) => node.level === component.lowestLevel
    )
    // const initialState = MS4Constants.initialPassiveState
    const javaWriter = new JavaWriter(moduleName)
    waitForInputGoals.forEach((item) => {
        console.log('task', getNodes(item, moduleName, 'task'))
        javaWriter.writeTaskMethods(
            getNodes(item, moduleName, 'task')
                // filter leaf tasks
                .filter((task) => !((task.children?.length || 0) > 0))
                .map((item) => nameTaskMethod(item.text))
        )
        javaWriter.writeTransitionsMethods(item)
    })
    // javaWriter.print()

    // const transitionClassName = javaWriter.getTransitionClassName()

    // const dnl =
    //     // var defs
    //     dnlWriter.declareVars(moduleName, transitionClassName) +
    //     // initial state
    //     dnlWriter.initialState(initialState) +
    //     // input signals
    //     dnlWriter.blockseparator(
    //         waitForInputGoals
    //             .map((goal) =>
    //                 dnlWriter.inputSignalsReceivement(initialState, goal.text)
    //             )
    //             .join('\n')
    //     ) +
    //     // open input ports "accepts on" statements
    //     dnlWriter.blockseparator(
    //         waitForInputGoals
    //             .map((goal) => dnlWriter.openInputPort(goal.text))
    //             .join('\n')
    //     ) +
    //     // writes the state sequence for a branch (a path that an input follows when recieived)
    //     waitForInputGoals
    //         .map((input) => stateSequenceForInput(moduleName, input))
    //         .map((seq) => dnlWriter.stateSequence(moduleName, seq))
    //         .join('') +
    //     // loop from output to waitforinput
    //     dnlWriter.blockseparator(
    //         dnlWriter.holdState(MS4Constants.outputState, initialState) +
    //             dnlWriter.outputMessage(MS4Constants.outputState)
    //     )

    // writeFileSync(`output/${dnlFileName(moduleName)}`, dnl.trim())
}

export const generateGoalModelDNLs = (model: Model) => {
    getTreeNodeByComponent('goal', convertToTree(model)[0]!).map(
        ([component, data]) => generateWaitForInput(component, data)
    )
}
