import Benchmark from 'benchmark'
import { generateGoalModelDNLs } from './ms4Builder'
import { loadModel } from './ObjectiveTree'

// convertToTree(validModel).forEach((tree) => TraverseTree(tree))
// generateWaitForInput(leveledComponent[0])
const validModel = loadModel('models/newmodel.txt')

const suite = new Benchmark.Suite()
suite
    .add('load model', () => {
        loadModel('models/newmodel.txt')
    })
    .add('generation', () => {
        generateGoalModelDNLs(validModel)
    })
    .on('complete', () => {
        console.log('done')
    })
    .on('cycle', (event: { target: string }) => {
        console.log(String(event.target))
    })
    .run({ async: true })
