import { Model } from 'GoalModel'
import { JavaWriter } from '../JavaWriter/index'
import {
    convertToTree,
    getNodes,
    getTreeNodeByComponent
} from '../ObjectiveTree'
import { branchGoals } from '../ObjectiveTree/treeNavigation'
import { ComponentData } from '../ObjectiveTree/types'
import { MS4Constants } from './constants'
import * as dnlWriter from './dnlWriting'
import { nameInput, nameTaskMethod } from './namer'

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
            waitForInputGoals.map(() => {}).join('\n') +
                dnlWriter.holdState(MS4Constants.outputState, initialState) +
                dnlWriter.outputMessage(MS4Constants.outputState)
        )
    console.log(waitForInputGoals)
    console.log(waitForInputGoals.map(branchGoals))
    console.log(dnl)
}

export const generateGoalModelDNLs = (model: Model) => {
    getTreeNodeByComponent('goal', convertToTree(model)[0]!).map(
        ([component, data]) => generateWaitForInput(component, data)
    )
}
