import { port } from '../../ObjectiveTree/connections'
import { linkedNode } from '../../ObjectiveTree/treeNavigation'
import { MS4Constants } from '../constants'
import {
    nameGoalContinuation,
    nameInput,
    transitionClassVarName,
    transitionMethodName
} from '../naming'
import { SequenceState } from '../types'

export const blockseparator = (block: string | string[], repeat = 2) =>
    (Array.isArray(block) ? block.join('\n') : block) + '\n'.repeat(repeat)

export const initialState = (initialState: string) =>
    blockseparator(`To start passivate in ${initialState}!`)

export const declareVars = (component: string, className: string) =>
    blockseparator(
        `use ${transitionClassVarName(component)} with type  ${
            MS4Constants.packageName
        }.${className} and default "new ${className}()"!`
    )

export const holdState = (
    state: linkedNode,
    nextstate?: linkedNode,
    newLines = 2
) =>
    blockseparator(
        [
            `hold in ${state.text} for time 5!`,
            `from ${state.text} ` +
                (nextstate
                    ? `go to ${nextstate?.text || ''}!`
                    : `go to ${MS4Constants.initialPassiveState}`)
        ].join('\n'),
        newLines
    )

export const outputMessage = (state: string) =>
    blockseparator(`after ${state} output MESSAGE_OUTPUT!`)

export const runTaskAndOutput = (state: string, taskName: string) =>
    blockseparator(
        `internal event for ${state}\n` + '<%\n' + `\tapiImpl.${taskName}`
    )

const getStateForInput = (port: port, component: string) => {
    let entryState = ''
    if (port.rootLink) {
        if (port.from.component.toLowerCase() === component.toLowerCase()) {
            entryState = port.from.state
        } else if (
            port.to.component.toLowerCase() === component.toLowerCase()
        ) {
            entryState = port.to.state
        }
        return entryState
    }

    if (port.from.component.toLowerCase() !== component.toLowerCase()) {
        entryState = port.from.state
    } else if (port.to.component.toLowerCase() !== component.toLowerCase()) {
        entryState = port.to.state
    }

    return nameGoalContinuation(entryState)
}

export const inputSignalsReceivement = (
    initialState: string,
    port: port,
    component: string
) =>
    `when in ${initialState} and receive ${nameInput(
        port.inputPortName
    )} go to ${getStateForInput(port, component)}!`

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

const externalTransition = (
    state: linkedNode
) => `external event for ${state.text}
<%
    output.add(out${state.port}, "out${state.text}")
%>!
`

export const stateSequence = (component: string, sequence: SequenceState) =>
    sequence
        .map((seq) =>
            seq
                .map((state, index, arr) =>
                    blockseparator(
                        holdState(state, arr[index + 1], 1) +
                            (state.direction === 'out'
                                ? externalTransition(state)
                                : internalTransition(component, state.text)),
                        1
                    )
                )
                .join('')
        )
        .join('') +
    `// EndSequence for sequence starting at ${
        sequence[0]?.[0]?.text || 'invalid sequence'
    }\n\n`
