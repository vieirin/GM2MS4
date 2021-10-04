import { writeFileSync } from 'fs'
import { uniqBy } from 'lodash'
import { Model } from '../GoalModel'
import { JavaWriter } from '../JavaWriter/index'
import {
    convertToTree,
    getNodes,
    getTreeNodeByComponent
} from '../ObjectiveTree'
import {
    componentConnections,
    Connections,
    indexPortsByGoal,
    invertPort,
    port
} from '../ObjectiveTree/connections'
import {
    branchGoalsWithOutput,
    hasChildren
} from '../ObjectiveTree/treeNavigation'
import {
    ComponentData,
    ComponentGoals,
    LeveledGoalComponent
} from '../ObjectiveTree/types'
import { MS4Constants } from './constants'
import { dnlFileName, nameTaskMethod, nameText, SeSFileName } from './naming'
import * as dnlWriter from './writing/dnlWriting'
import { exposeOutputPort, openInputPort } from './writing/dnlWriting'
import { writeConnections, writePerspective } from './writing/sesWriting'

const isTreeRoot = (goal: LeveledGoalComponent[]) =>
    goal.length == 1 && goal[0].isRoot

export const generateMS4Model = (
    moduleName: string,
    component: ComponentData,
    connections: port[]
) => {
    const waitForInputGoals = component.goals.filter(
        (node) => node.level === component.lowestLevel
    ) as LeveledGoalComponent[]

    const root = waitForInputGoals.reduce(
        (prev, curr) => (curr.isRoot && !prev ? curr : undefined),
        undefined as LeveledGoalComponent | undefined
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

    const connIndex = indexPortsByGoal(moduleName, connections)

    // the root-level must have its ports inverted for connections
    const outputConnections = connections
        .filter((conn) => conn.from.component.toLowerCase() !== moduleName)
        .map((out) => (isTreeRoot(waitForInputGoals) ? invertPort(out) : out))
    const inputConnections = connections
        .filter((conn) => conn.from.component.toLowerCase() === moduleName)
        .map((out) => (isTreeRoot(waitForInputGoals) ? invertPort(out) : out))

    const inputNames = waitForInputGoals.map((input) => input.text)
    const inputSequence = waitForInputGoals.map((input) =>
        branchGoalsWithOutput(moduleName, input, connIndex)
    )
    const initialState = MS4Constants.initialPassiveState
    const dnl =
        // var defs
        dnlWriter.declareVars(moduleName, transitionClassName) +
        // initial state
        dnlWriter.initialState(initialState) +
        // input signals
        dnlWriter.blockseparator(
            inputConnections
                .filter((conn) => inputNames.includes(conn.from.state))
                .map((conn) =>
                    dnlWriter.defaultSignalsReceivement(
                        initialState,
                        conn,
                        moduleName
                    )
                )
        ) +
        dnlWriter.blockseparator([
            ...inputConnections
                .filter((conn) => !inputNames.includes(conn.from.state))
                .map((conn) =>
                    dnlWriter.inputSignalsReceivement(
                        initialState,
                        conn,
                        moduleName
                    )
                ),
            root
                ? dnlWriter.startSignalsReceivement(initialState, root.text)
                : '',
            dnlWriter.stopSignalReceivement(initialState)
        ]) +
        dnlWriter.blockseparator([
            ...outputConnections.map((conn) =>
                exposeOutputPort(conn.inputPortName)
            ),
            exposeOutputPort(MS4Constants.stopPort, 'none')
        ]) +
        // open input ports "accepts on" statements
        dnlWriter.blockseparator([
            ...outputConnections.map((conn) =>
                dnlWriter.openInputPort(conn.outputPortName)
            ),
            openInputPort(MS4Constants.startSignal, 'none')
        ]) +
        // writes the state sequence for a branch (a path that an input follows when received)

        inputSequence
            .map((seq) => dnlWriter.stateSequence(moduleName, seq, connIndex))
            .join('')

    writeFileSync(`output/${dnlFileName(moduleName)}`, dnl.trim())
}

const generateSES = (
    actorName: string,
    connections: Connections,
    componentGoals: ComponentGoals[]
) => {
    const allPorts = Object.entries(connections).reduce(
        (prev, [_, ports]) => [...prev, ...ports],
        [] as port[]
    )
    const ses =
        writePerspective(
            actorName,
            componentGoals.map(([component]) => component)
        ) + writeConnections(uniqBy(allPorts, 'outputPortName'))

    writeFileSync(`output/Models.ses/${SeSFileName}`, ses.trim())
}

export const generateGoalModelDNLs = (model: Model) => {
    const tree = convertToTree(model)[0]!
    const connections = componentConnections(tree)
    const goalsPerComponent = getTreeNodeByComponent('goal', tree)
    goalsPerComponent.forEach(([component, data]) =>
        generateMS4Model(component, data, connections[component])
    )
    generateSES(
        nameText(model.actors[0].text || ''),
        connections,
        goalsPerComponent
    )
}
