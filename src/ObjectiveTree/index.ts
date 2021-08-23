import { readFileSync } from 'fs'
import { GoalModel } from '../types/gm'
import { ObjectiveTree, relationship } from './types'

export const validateModel = (model: GoalModel.Model) => {
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
    const model = JSON.parse(modelFile.toString()) as GoalModel.Model

    validateModel(model)

    return model
}

export const convertToTree = (model: GoalModel.Model) => {
    validateModel(model)

    const nodeChildren = (
        actor: GoalModel.Actor,
        id?: string
    ): [ObjectiveTree[] | undefined, relationship] => {
        if (!id) {
            return [undefined, 'none']
        }

        const links = model.links.filter((link) => link.target === id)
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

        const allEqual = relations.every((v) => v === relations[0])
        if (!allEqual) {
            throw new Error(`
                [INVALID MODEL]: You can't mix and/or relations
            `)
        }

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
            .filter((child) => child !== undefined) as ObjectiveTree[]

        return [[...children], relations[0]]
    }

    const nodeToTree = (
        actor: GoalModel.Actor,
        node: GoalModel.Node
    ): ObjectiveTree => {
        const [children, relation] = nodeChildren(actor, node?.id)
        return {
            ...node,
            relation,
            children: children
        }
    }

    const trees = model.actors
        .map((actor) => {
            const rootNode = actor.nodes.find(
                (item) => item.customProperties.selected
            )
            if (!rootNode) {
                return undefined
            }
            return nodeToTree(actor, rootNode)
        })
        .filter((tree) => tree) as ObjectiveTree[]

    return trees
}
