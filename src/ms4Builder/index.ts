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
    port
} from '../ObjectiveTree/connections'
import {
    branchGoalsWithOutput,
    hasChildren
} from '../ObjectiveTree/treeNavigation'
import {
    component,
    ComponentData,
    ComponentGoals,
    LeveledGoalComponent
} from '../ObjectiveTree/types'
import { MS4Constants } from './constants'
import { createMS4Project, inputFiles as outputFiles } from './createMS4Project'
import {
    capitalize,
    dnlFileName,
    nameTaskMethod,
    nameText,
    SeSFileName,
    transitionClassVarName
} from './naming'
import * as dnlWriter from './writing/dnlWriting'
import { exposeOutputPort, openInputPort } from './writing/dnlWriting'
import {
    writeConnections,
    writePerspective,
    writeStopRelation
} from './writing/sesWriting'

const isTreeRoot = (goal: LeveledGoalComponent[]) =>
    goal.length == 1 && goal[0].isRoot

export const generateMS4Model = (
    moduleName: string,
    component: ComponentData,
    connections: port[]
): { dnl: outputFiles[]; java: outputFiles[] } => {
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
        javaWriter.writeTransitionsMethods(inputNode, inputNode.parentRelation)
    })
    const javaComponents = javaWriter.close()

    const transitionClassName = javaWriter.getTransitionClassName()

    const connIndex = indexPortsByGoal(moduleName, connections)

    // the root-level must have its ports inverted for connections
    const outputConnections = connections.filter(
        (conn) => conn.from.component.toLowerCase() !== moduleName
    )
    const inputConnections = connections.filter(
        (conn) => conn.from.component.toLowerCase() === moduleName
    )

    const inputNames = waitForInputGoals.map((input) => input.text)
    const inputSequence = waitForInputGoals.map((input) =>
        branchGoalsWithOutput(moduleName, input, connIndex)
    )
    const initialState = MS4Constants.initialPassiveState
    const dnl =
        // var defs
        dnlWriter.blockseparator([
            dnlWriter.declareVars(
                transitionClassVarName(moduleName),
                transitionClassName
            ),
            dnlWriter.declareVars('result', 'Result', `\\"${moduleName}\\"`)
        ]) +
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
                ? dnlWriter.startSignalsReceivement(
                      initialState,
                      root.text,
                      moduleName
                  )
                : dnlWriter.stopSignalReceivement(initialState)
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
                dnlWriter.openInputPort(conn.outputPortName, 'Result')
            ),
            root ? openInputPort(MS4Constants.startSignal, 'String') : ''
        ]) +
        // writes the state sequence for a branch (a path that an input follows when received)
        inputSequence
            .map((seq) =>
                dnlWriter.stateSequence(moduleName, seq, connIndex, !!root)
            )
            .join('') +
        dnlWriter.blockseparator(root ? dnlWriter.addLibs() : '')

    writeFileSync(`output/${dnlFileName(moduleName)}`, dnl.trim())
    return {
        dnl: [[dnlFileName(moduleName), dnl.trim()]],
        java: javaComponents
    }
}

const generateSES = (
    actorName: string,
    connections: Connections,
    componentGoals: ComponentGoals[],
    rootComponent: component
): [string, string] => {
    const allPorts = Object.entries(connections).reduce(
        (prev, [_, ports]) => [...prev, ...ports],
        [] as port[]
    )

    const ses =
        writePerspective(
            actorName,
            componentGoals.map(([component]) => component)
        ) +
        writeConnections(uniqBy(allPorts, 'outputPortName')) +
        writeStopRelation(
            capitalize(rootComponent),
            componentGoals
                .filter(([component]) => component !== rootComponent)
                .map(([component]) => capitalize(component))
        )

    writeFileSync(`output/Models.ses/${SeSFileName}`, ses.trim())
    return [SeSFileName, ses.trim()]
}

export const generateGoalModelDNLs = (model: Model) => {
    const tree = convertToTree(model)[0]!
    const connections = componentConnections(tree)
    const goalsPerComponent = getTreeNodeByComponent('goal', tree)

    const dnlData = goalsPerComponent
        .map(([component, data]) =>
            generateMS4Model(component, data, connections[component])
        )
        .reduce(
            (prev, curr) => ({
                dnl: [...prev.dnl, ...curr.dnl],
                java: [...prev.java, ...curr.java]
            }),
            { dnl: [], java: [] } as Record<'dnl' | 'java', outputFiles[]>
        )
    const sesData = generateSES(
        nameText(model.actors[0].text || ''),
        connections,
        goalsPerComponent,
        tree.component
    )

    createMS4Project('Blockchain_mode_auto', sesData, dnlData.dnl, dnlData.java)
}
