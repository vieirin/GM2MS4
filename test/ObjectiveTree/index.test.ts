import { convertToTree, loadModel } from '../../src/ObjectiveTree'
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
        const validModel = loadModel('models/txregister.txt')
        it('should create a new objectivetree', () => {
            expect(convertToTree(validModel)).toEqual(expect.anything())
        })

        it('should be able to traverse the tree', () => {
            convertToTree(validModel).forEach((tree) => TraverseTree(tree))
        })
    })
})
