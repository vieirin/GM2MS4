import { readFileSync } from 'fs'
import { Actor, Model, Node } from 'GoalModel'
import { LeveledGoalComponent, ObjectiveTree, relationship } from './types'

export const validateModel = (model: Model) => {
    const root = model.actors
        .map((item) =>
            // check in node list if there are more than one root
            item.nodes.reduce((hasRoot, node) => {
                if (hasRoot && node.customProperties.selected) {
                    return false
                }
                return node.customProperties.selected || hasRoot
            }, false)
        )
        // reduce the actors array to "are all actors valid?"
        .reduce((isValid, actorRootValid) => isValid && actorRootValid, true)
    if (!root) {
        throw 'invalid number of root, one allowed'
    }
}

export const loadModel = (filename: string) => {
    const modelFile = readFileSync(filename)
    const model = JSON.parse(modelFile.toString()) as Model

    validateModel(model)

    return model
}

export const convertToTree = (model: Model) => {
    validateModel(model)

    const nodeChildren = (
        actor: Actor,
        id?: string
    ): [ObjectiveTree[] | undefined, relationship] => {
        if (!id) {
            return [undefined, 'none']
        }

        // find related objects in the links array
        const links = model.links.filter((link) => link.target === id)

        // get the set of relations associated to the parent element
        const relations = links.map((link) => {
            switch (link.type) {
                case 'istar.AndRefinementLink':
                    return 'and'
                case 'istar.OrRefinementLink':
                    return 'or'
                default:
                    throw new Error(
                        `[UNSUPPORTED LINK]: Please implement ${link.type} decoding`
                    )
            }
        })

        // assert all elements are equal
        const allEqual = relations.every((v) => v === relations[0])
        if (!allEqual) {
            throw new Error(`
                [INVALID MODEL]: You can't mix and/or relations
            `)
        }

        // recursively find children nodes' children
        const children: ObjectiveTree[] = links
            .map((link) => {
                // from links find linked the linked nodes
                const node = actor.nodes.find((item) => item.id === link.source)
                if (!node) {
                    return undefined
                }

                const [granChildren, relation] = nodeChildren(actor, node?.id)
                return { ...node, children: granChildren, relation }
            })
            // clean undefined children from the tree
            .filter((child) => child !== undefined) as ObjectiveTree[]

        return [[...children], relations[0]]
    }

    const nodeToTree = (actor: Actor, node: Node): ObjectiveTree => {
        const [children, relation] = nodeChildren(actor, node?.id)
        return {
            ...node,
            relation,
            children: children
        }
    }

    const trees = model.actors
        .map((actor) => {
            // find root node
            const rootNode = actor.nodes.find(
                (item) => item.customProperties.selected
            )
            if (!rootNode) {
                return undefined
            }

            // calc tree
            return nodeToTree(actor, rootNode)
        })
        // filter undefined trees (those without a root npde)
        .filter((tree) => tree) as ObjectiveTree[]

    return trees
}

export const getGoals = (
    tree: ObjectiveTree,
    component: string,
    level = 0
): LeveledGoalComponent[] => {
    const { children, ...node } = tree
    const nodeComponent = node.customProperties.component

    // find for requested component on the tree
    // there are case where the component is under some child of
    // another component type
    if (!nodeComponent && nodeComponent !== component && children) {
        const treeLevel = node.customProperties.selected ? level : level + 1
        return [
            ...children
                .map((child) => getGoals(child, component, treeLevel))
                .flat()
        ]
    }

    if (node.type === 'istar.Task') {
        return []
    }

    if (!children || !children.length) {
        return [{ ...node, level }]
    }

    return [
        { ...node, level },
        ...children.map((child) => getGoals(child, component, level + 1)).flat()
    ]
}
