import { loadModel } from '../../src/ObjectiveTree'

describe('Test load model', () => {
    it('should load default file', () => {
        expect(() => loadModel('models/txregister.txt')).not.toThrow()
    })

    it('should throw error for multiple roots', () => {
        expect(() => loadModel('models/txregister_mult_root.txt')).toThrow()
    })
})
