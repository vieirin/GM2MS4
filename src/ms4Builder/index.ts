import { Model } from 'GoalModel'
import { JavaWriter } from '../JavaWriter'
import {
    convertToTree,
    getNodes,
    getTreeNodeByComponent
} from '../ObjectiveTree'
import { ComponentData, leafType, ObjectiveTree } from '../ObjectiveTree/types'
import { MS4Constants } from './constants'
import * as dnlWriter from './dnlWriting'
import { nameInput, nameTaskMethod } from './namer'

const firstChild = (type: leafType, children?: ObjectiveTree[]) =>
    children?.filter((child) => child.type === type)[0]

export const generateWaitForInput = (
    moduleName: string,
    component: ComponentData
) => {
    const waitForInputGoals = component.goals.filter(
        (node) => node.level === component.lowestLevel
    )
    const initialState = MS4Constants.initialPassiveState

    const javaWriter = new JavaWriter()
    waitForInputGoals.forEach((item) => {
        console.log('here')
        javaWriter.writeTaskMethods(
            getNodes(item, moduleName, 'task').map((item) =>
                nameTaskMethod(item.text)
            )
        )
    })
    javaWriter.print()

    const dnl =
        dnlWriter.blockseparator(`To start passivate in ${initialState}!`) +
        dnlWriter.holdState(MS4Constants.outputState, initialState) +
        dnlWriter.outputMessage(MS4Constants.outputState) +
        dnlWriter.blockseparator(
            waitForInputGoals
                .map(
                    (goal) =>
                        `when in ${initialState} and receives ${nameInput(
                            goal.text
                        )} go to ${goal.text}!`
                )
                .join('\n')
        ) +
        dnlWriter.blockseparator(
            waitForInputGoals
                .map((goal) => {
                    const state = goal.text
                    const firstGoal = firstChild('goal', goal.children)
                    if (firstGoal) {
                        return dnlWriter.holdState(state, firstGoal.text)
                    }
                    const fTask = firstChild('task', goal.children)
                    if (fTask) {
                        return dnlWriter.runTaskAndOutput(state, fTask.text)
                    }
                    throw new Error('A top goal need at least a leaf task')
                })
                .join('\n')
        )
    console.log(dnl)
}

export const generateGoalModelDNLs = (model: Model) => {
    getTreeNodeByComponent('goal', convertToTree(model)[0]!).map(
        ([component, data]) => generateWaitForInput(component, data)
    )
}
