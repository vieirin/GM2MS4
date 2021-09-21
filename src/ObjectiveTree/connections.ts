import mergeWith from 'lodash.mergewith'
import { ObjectiveTree, treeNode } from './types'
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

type Connections = {
    [K: string]: port[]
}

const createPort = (from: treeNode, to: treeNode): port => ({
    inputPortName: `from_${from.identifier}_to_${to.identifier}`,
    outputPortName: `from_${to.identifier}_to_${from.identifier}`,
    from: {
        state: from.text,
        component: from.component
    },
    to: {
        state: to.text,
        component: to.component
    },
    type: 'String',
    rootLink: from.isRoot || to.isRoot
})

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
