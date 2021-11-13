import { convertToTree, loadModel } from '../../src/ObjectiveTree'
import { getGoals } from '../../src/ObjectiveTree/treeNavigation'
import { TraverseTree } from '../../src/ObjectiveTree/types'

describe('On load model', () => {
    it('should load default file', () => {
        expect(() => loadModel('models/txregister.txt')).not.toThrow()
    })

    it('should throw error for multiple roots', () => {
        expect(() => loadModel('models/txregister_mult_root.txt')).toThrow()
    })
})

describe('Test tree creation', () => {
    describe('given a valid loaded model', () => {
        const validModel = loadModel('models/newModel.txt')
        it('should create a new objectivetree', () => {
            expect(convertToTree(validModel)).toEqual(expect.anything())
        })

        it('should be able to traverse the tree', () => {
            convertToTree(validModel).forEach((tree) =>
                TraverseTree(tree, false)
            )
        })
    })
})

describe('Test tree properties', () => {
    const tree = convertToTree(loadModel('models/newModel.txt'))

    it('should have identifiers on its goals', () => {
        tree.map(getGoals).forEach((goals) => {
            goals.forEach((goal) => {
                expect(goal).toMatchObject({
                    identifier: expect.stringMatching(/G\d*/)
                })
            })
        })
    })
})
