import { uniqBy } from 'lodash'
import { Model } from '../GoalModel/goalModel.js'
import { JavaWriter } from '../JavaWriter/JavaWriter.js'
import {
    componentConnections,
    Connections,
    indexPortsByGoal,
    port
} from '../ObjectiveTree/connections.js'
import {
    convertToTree,
    getNodes,
    getTreeNodeByComponent
} from '../ObjectiveTree/objectiveTree.js'
import {
    branchGoalsWithOutput,
    hasChildren
} from '../ObjectiveTree/treeNavigation.js'
import {
    component,
    ComponentData,
    ComponentGoals,
    LeveledGoalComponent
} from '../ObjectiveTree/types.js'
import { MS4Constants } from './constants.js'
import { createMS4Project, inputFiles } from './createMS4Project.js'
import {
    capitalize,
    dnlFileName,
    nameTaskMethod,
    nameText,
    SeSFileName,
    transitionClassVarName
} from './naming.js'
import * as dnlWriter from './writing/dnlWriting.js'
import { exposeOutputPort, openInputPort } from './writing/dnlWriting.js'
import {
    writeConnections,
    writePerspective,
    writeStopRelation
} from './writing/sesWriting.js'

export const generateMS4Model = (
    moduleName: string,
    component: ComponentData,
    connections: port[]
): { dnl: inputFiles[]; java: inputFiles[] } => {
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
            .join('')

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

    return [SeSFileName, ses.trim()]
}

export const generateGoalModelDNLs = async (
    model: Model,
    projectName: string
) => {
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
            { dnl: [], java: [] } as Record<'dnl' | 'java', inputFiles[]>
        )
    const sesData = generateSES(
        nameText(model.actors[0].text || ''),
        connections,
        goalsPerComponent,
        tree.component
    )

    return await createMS4Project(
        projectName,
        sesData,
        dnlData.dnl,
        dnlData.java
    )
}
