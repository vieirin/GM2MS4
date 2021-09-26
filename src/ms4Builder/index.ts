import { writeFileSync } from 'fs'
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
import { SequenceState } from './types'
import * as dnlWriter from './writing/dnlWriting'
import { exposeOutputPort } from './writing/dnlWriting'
import { writeConnections, writePerspective } from './writing/sesWriting'

const stateSequenceForInput = (
    component: string,
    inputNode: LeveledGoalComponent,
    connections: port[]
): SequenceState => {
    const indexed = indexPortsByGoal(component, connections)
    return branchGoalsWithOutput(component, inputNode, indexed)
}

export const generateMS4Model = (
    moduleName: string,
    component: ComponentData,
    connections: port[]
) => {
    const waitForInputGoals = component.goals.filter(
        (node) => node.level === component.lowestLevel
    ) as LeveledGoalComponent[]

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
            connections.map((conn) =>
                dnlWriter.inputSignalsReceivement(
                    initialState,
                    conn,
                    moduleName
                )
            )
        ) +
        dnlWriter.blockseparator(
            connections.map((conn) => exposeOutputPort(conn.outputPortName))
        ) +
        // open input ports "accepts on" statements
        dnlWriter.blockseparator(
            connections.map((conn) =>
                dnlWriter.openInputPort(conn.inputPortName)
            )
        ) +
        // writes the state sequence for a branch (a path that an input follows when received)
        waitForInputGoals
            .map((input) =>
                stateSequenceForInput(moduleName, input, connections)
            )
            .map((seq) => dnlWriter.stateSequence(moduleName, seq))
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
        ) + writeConnections(allPorts)

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
