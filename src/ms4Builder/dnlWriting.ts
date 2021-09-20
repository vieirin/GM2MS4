import { MS4Constants } from './constants'
import {
    nameInput,
    transitionClassVarName,
    transitionMethodName
} from './naming'
import { SequenceState } from './types'

export const blockseparator = (block: string, repeat = 2) =>
    block + '\n'.repeat(repeat)

export const initialState = (initialState: string) =>
    blockseparator(`To start passivate in ${initialState}!`)

export const declareVars = (component: string, className: string) =>
    blockseparator(
        `use ${transitionClassVarName(component)} with type  ${
            MS4Constants.packageName
        }.${className} and default "new ${className}()"!`
    )

export const holdState = (state: string, nextstate?: string, newLines = 2) =>
    blockseparator(
        [
            `hold in ${state} for time 5!`,
            `from ${state} go to ${nextstate || ''}!`
        ].join('\n'),
        newLines
    )

export const outputMessage = (state: string) =>
    blockseparator(`after ${state} output MESSAGE_OUTPUT!`)

export const runTaskAndOutput = (state: string, taskName: string) =>
    blockseparator(
        `internal event for ${state}\n` + '<%\n' + `\tapiImpl.${taskName}`
    )

export const inputSignalsReceivement = (
    initialState: string,
    goalName: string
) =>
    `when in ${initialState} and receive ${nameInput(
        goalName
    )} go to ${goalName}!`

export const openInputPort = (port: string, type = 'String') =>
    `accepts input on ${nameInput(port)} with type ${type}!`

export const exposeOutputPort = (port: string, type = 'String') =>
    `generates output on ${port} with type ${type}!`
const internalTransition = (
    component: string,
    state: string
) => `internal event for ${state}
<%
    ${transitionClassVarName(component)}.${transitionMethodName(state)}();
%>!
`

export const stateSequence = (component: string, sequence: SequenceState) =>
    sequence
        .map((state, index, arr) =>
            blockseparator(
                holdState(
                    state.text,
                    arr[index + 1]?.text || MS4Constants.outputState,
                    1
                ) + internalTransition(component, state.text),
                1
            )
        )
        .join('') +
    `// EndSequence for sequence starting at ${
        sequence[0]?.text || 'invalid sequence'
    }\n\n`
