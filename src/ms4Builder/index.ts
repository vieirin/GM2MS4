import { writeFileSync } from 'fs'
import { Model } from '../GoalModel'
import { JavaWriter } from '../JavaWriter/index'
import {
    convertToTree,
    getNodes,
    getTreeNodeByComponent
} from '../ObjectiveTree'
import { componentConnections, port } from '../ObjectiveTree/connections'
import { branchGoals, hasChildren } from '../ObjectiveTree/treeNavigation'
import { ComponentData, LeveledGoalComponent } from '../ObjectiveTree/types'
import { MS4Constants } from './constants'
import * as dnlWriter from './dnlWriting'
import { exposeOutputPort } from './dnlWriting'
import { dnlFileName, nameTaskMethod } from './naming'
import { SequenceState } from './types'

const stateSequenceForInput = (
    component: string,
    inputNode: LeveledGoalComponent
): SequenceState => [inputNode, ...branchGoals(component, inputNode)]

export const generateMS4Model = (
    moduleName: string,
    component: ComponentData,
    connections: port[]
) => {
    const waitForInputGoals = component.goals.filter(
        (node) => node.level === component.lowestLevel
    )
    const javaWriter = new JavaWriter(moduleName)
    waitForInputGoals.forEach((inputNode) => {
        javaWriter.writeTaskMethods(
            getNodes(inputNode, moduleName, 'task')
                // filter leaf tasks
                .filter((node) => !hasChildren(node))
                // return the tasks methods name
                .map((item) => nameTaskMethod(item.text))
        )
        javaWriter.writeTransitionsMethods(inputNode)
    })
    javaWriter.close()

    const transitionClassName = javaWriter.getTransitionClassName()
    const initialState = MS4Constants.initialPassiveState
    const dnl =
        // var defs
        dnlWriter.declareVars(moduleName, transitionClassName) +
        // initial state
        dnlWriter.initialState(initialState) +
        // input signals
        dnlWriter.blockseparator(
            connections
                .map((conn) =>
                    dnlWriter.inputSignalsReceivement(
                        initialState,
                        conn,
                        moduleName
                    )
                )
                .join('\n')
        ) +
        dnlWriter.blockseparator(
            connections
                .map((conn) => exposeOutputPort(conn.outputPortName))
                .join('\n')
        ) +
        // open input ports "accepts on" statements
        dnlWriter.blockseparator(
            connections
                .map((conn) => dnlWriter.openInputPort(conn.inputPortName))
                .join('\n')
        ) +
        // writes the state sequence for a branch (a path that an input follows when received)
        waitForInputGoals
            .map((input) => stateSequenceForInput(moduleName, input))
            .map((seq) => seq.filter((item) => item.component === moduleName))
            .map((seq) => dnlWriter.stateSequence(moduleName, seq))
            .join('') +
        // loop from output to waitforinput
        dnlWriter.blockseparator(
            dnlWriter.holdState(MS4Constants.outputState, initialState) +
                dnlWriter.outputMessage(MS4Constants.outputState)
        )

    writeFileSync(`output/${dnlFileName(moduleName)}`, dnl.trim())
}

export const generateGoalModelDNLs = (model: Model) => {
    const tree = convertToTree(model)[0]!
    const connections = componentConnections(tree)
    getTreeNodeByComponent('goal', tree).map(([component, data]) =>
        generateMS4Model(component, data, connections[component])
    )
}
