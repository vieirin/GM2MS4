import { port, StatePortIndex } from '../../ObjectiveTree/connections'
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
    blockseparator(`To start passivate in ${initialState}!
Passivate in ${MS4Constants.stopState}!
`)

export const declareVars = (
    variable: string,
    className: string,
    constructor?: string
) =>
    `use ${variable} with type  ${
        MS4Constants.packageName
    }.${className} and default "new ${MS4Constants.packageName}.${className}(${
        constructor || ''
    })"!`

export const holdState = (
    state: linkedNode,
    nextstate?: linkedNode,
    stop?: boolean,
    newLines = 2
) =>
    blockseparator(
        [
            `hold in ${state.text} for time 5!`,
            `from ${state.text} ` +
                (nextstate && !nextstate.text.includes('_continue')
                    ? `go to ${nextstate?.text || ''}!`
                    : stop
                    ? `go to ${MS4Constants.stopState}!`
                    : `go to ${MS4Constants.initialPassiveState}!`)
        ].join('\n'),
        newLines
    )

export const outputMessage = (state: string) =>
    blockseparator(`after ${state} output MESSAGE_OUTPUT!`)

export const runTaskAndOutput = (state: string, taskName: string) =>
    blockseparator(
        `internal event for ${state}\n` + '<%\n' + `\tapiImpl.${taskName}`
    )

const getStateForInput = (port: port, component: string, isInput?: boolean) => {
    let entryState = ''
    if (port.rootLink) {
        entryState = nameGoalContinuation(port.to.state)
        return entryState
    }

    if (isInput) {
        return port.from.state
    }

    if (port.to.component.toLowerCase() !== component) {
        return nameGoalContinuation(port.to.state)
    }

    return entryState
}

const externalEventWith = (
    initialState: string,
    port: port,
    reset: boolean
) => `external event for ${initialState} with ${nameInput(port.inputPortName)}
<%
    ${
        reset
            ? 'result.reset();'
            : 'result = result.update(messageList.get(0).getData());'
    }
    
%>!`

export const defaultSignalsReceivement = (
    initialState: string,
    port: port,
    component: string
) =>
    `when in ${initialState} and receive ${nameInput(
        port.inputPortName
    )} go to ${getStateForInput(port, component, true)}!
${externalEventWith(
    initialState,
    port,
    !getStateForInput(port, component, true).endsWith('_continue')
)}`

export const startSignalsReceivement = (
    initialState: string,
    nextState: string
) =>
    `when in ${initialState} and receive ${MS4Constants.startSignal} go to ${nextState}!`

export const stopSignalReceivement = (initialState: string) =>
    `when in ${initialState} and receive ${MS4Constants.stopPort} go to ${MS4Constants.stopState}!`

export const inputSignalsReceivement = (
    initialState: string,
    port: port,
    component: string
) =>
    `when in ${initialState} and receive ${nameInput(
        port.inputPortName
    )} go to ${getStateForInput(port, component)}!
${externalEventWith(
    initialState,
    port,
    !getStateForInput(port, component).endsWith('_continue')
)}
`

type allowedTypes = 'none' | 'String' | 'Result'
export const openInputPort = (port: string, type: allowedTypes = 'String') =>
    `accepts input on ${nameInput(port)} ${
        type === 'none' ? '' : `with type ${type}`
    } !`

export const exposeOutputPort = (port: string, type: allowedTypes = 'Result') =>
    `generates output on ${port} ${type === 'none' ? '' : `with type ${type}`}!`

const internalTransition = (
    component: string,
    state: string,
    printResult: boolean
) => `internal event for ${state}
<%
    ${`${transitionClassVarName(component)}.${transitionMethodName(
        state
    )}(result);
    ${
        printResult
            ? 'System.out.println(!result.isSuccess() ? "Simulation has failed"  : "Simulation passed");'
            : ''
    }`.trim()}
%>!
`

const externalTransition = (
    state: linkedNode,
    conn: StatePortIndex,
    stop: boolean,
    root: boolean,
    overrideStateSource?: string
) => `
${
    stop
        ? `after ${overrideStateSource || state.text} output ${
              MS4Constants.stopPort
          }!`
        : `after ${overrideStateSource || state.text} output ${
              conn.get(state.originalName || state.text)![root ? 'in' : 'out']
          }!
output event for ${overrideStateSource || state.text}
<%
    output.add(out${
        conn.get(state.originalName || state.text)![root ? 'in' : 'out']
    }, result);
%>!
          `
}
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isLast = (arr: Array<any>, idx: number) => arr.length - 1 === idx

export const stateSequence = (
    component: string,
    sequence: SequenceState,
    connections: StatePortIndex,
    root: boolean
) =>
    sequence
        .map((seq, seqIndex, seqArr) =>
            seq
                .map((state, index, arr) => {
                    let returnEvent = ''
                    const last = isLast(seqArr, seqIndex) && isLast(arr, index)

                    // rootLast move the verifier and the system to stop state
                    // it also prints the simulation result based on the "result" var
                    const rootLast = last && root

                    if (last && state.direction !== 'out') {
                        returnEvent = externalTransition(
                            seqArr[0][0],
                            connections,
                            rootLast,
                            root,
                            state.text
                        )
                    }

                    return blockseparator(
                        holdState(state, arr[index + 1], rootLast, 1) +
                            ((state.type === 'goal' && !root) || rootLast
                                ? internalTransition(
                                      component,
                                      state.text,
                                      rootLast
                                  )
                                : '') +
                            (state.direction === 'out'
                                ? externalTransition(
                                      state,
                                      connections,
                                      rootLast,
                                      root
                                  )
                                : '') +
                            returnEvent
                    )
                })
                .join('')
        )
        .join('') +
    `// EndSequence for sequence starting at ${
        sequence[0]?.[0]?.text || 'invalid sequence'
    }\n\n`
