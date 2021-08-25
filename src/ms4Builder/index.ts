import { LeveledGoalComponent } from '../ObjectiveTree/types'
import { MS4Constants } from './constants'

const signalTransition = (state: string, signal: string, nextState: string) =>
    `when in ${state} and receives ${signal} go to ${
        nextState || MS4Constants.MISSING_STATE
    }!`

export const generateWaitForInput = (nodes: LeveledGoalComponent[]) => {
    const waitForInputGoals = nodes.filter((node) => node.level === 0)
    let dnl = `To start passivate in ${MS4Constants.initialPassiveState}!\n`

    // add the input signals to the wait state
    dnl += waitForInputGoals
        .map((goal) =>
            goal.customProperties?.receives
                ? signalTransition(
                      MS4Constants.initialPassiveState,
                      goal.customProperties.receives,
                      ''
                  )
                : ''
        )
        .filter((line) => line)
        .join('\n')
    console.log(dnl)
}
