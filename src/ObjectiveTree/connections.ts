import mergeWith from 'lodash.mergewith'
import { sanitizeComponent } from '../ms4Builder/naming'
import { component, ObjectiveTree, treeNode } from './types'
interface connectionNode {
    state: string
    component: string
}

export type port = {
    inputPortName: string
    outputPortName: string
    from: connectionNode
    to: connectionNode
    type: 'String'
    rootLink: boolean
}

export type Connections = {
    [K: string]: port[]
}

const isRootLink = (from: treeNode, to: treeNode) => from.isRoot || to.isRoot

const createPort = (from: treeNode, to: treeNode): port => {
    return {
        inputPortName: `from_${from.identifier}_to_${to.identifier}`,
        outputPortName: `from_${to.identifier}_to_${from.identifier}`,
        from: {
            state: from.text,
            component: sanitizeComponent(from.component)
        },
        to: {
            state: to.text,
            component: sanitizeComponent(to.component)
        },
        type: 'String',
        rootLink: isRootLink(from, to)
    }
}

// merge reducing result concating arrays\
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mergeConcat = (arrValue: any, srcValue: any) => {
    if (Array.isArray(arrValue)) {
        return arrValue.concat(srcValue)
    }
    return
}

// this will find connections over the tree between distincts components and describing them on the
// Connections structure form
export const componentConnections = (tree: ObjectiveTree): Connections =>
    tree.children?.reduce((memo, child) => {
        const otherPortsOnBranch = componentConnections(child)
        if (child.component !== tree.component) {
            return mergeWith(
                memo,
                otherPortsOnBranch,
                {
                    [child.component]: [createPort(tree, child)],
                    [tree.component]: [createPort(child, tree)]
                },
                mergeConcat
            )
        }
        return mergeWith(memo, otherPortsOnBranch, mergeConcat)
    }, {}) || {}

const componentTransactions = (component: component, ports: port[]) => {}

export type StatePortIndex = Map<string, { out: string; in: string }>
export const indexPortsByGoal = (
    component: component,
    ports: port[]
): StatePortIndex =>
    new Map(
        ports.map((port) => [
            port.from.state,
            { out: port.outputPortName, in: port.inputPortName }
        ])
    )
