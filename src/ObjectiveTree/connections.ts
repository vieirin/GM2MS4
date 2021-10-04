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

const isRootLink = (from: treeNode) => from.isRoot

const createPort = (from: treeNode, to: treeNode): port => {
    const [useFrom, useTo] = [from, to]

    return {
        inputPortName: `From_${useTo.identifier}_to_${useFrom.identifier}`,
        outputPortName: `From_${useFrom.identifier}_to_${useTo.identifier}`,
        from: {
            state: useFrom.text,
            component: sanitizeComponent(useFrom.component)
        },
        to: {
            state: useTo.text,
            component: sanitizeComponent(useTo.component)
        },
        type: 'String',
        rootLink: isRootLink(from)
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

export const invertPort = (p: port): port => ({
    ...p,
    inputPortName: p.outputPortName,
    outputPortName: p.inputPortName
})

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
                    [child.component]: [
                        createPort(tree, child),
                        createPort(child, tree)
                    ],
                    [tree.component]: [
                        createPort(tree, child),
                        createPort(child, tree)
                    ].map((port) =>
                        isRootLink(tree) ? invertPort(port) : port
                    )
                },
                mergeConcat
            )
        }
        return mergeWith(memo, otherPortsOnBranch, mergeConcat)
    }, {}) || {}

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
