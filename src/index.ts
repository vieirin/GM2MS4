import { readFileSync } from 'fs'

const modelFile = readFileSync('models/txregister.txt')

const model = JSON.parse(modelFile.toString()) as GoalModel.Model

try {
    const root = model.actors.filter((item) => item.customProperties.selected)
    if (!root || root.length > 1) {
        throw 'invalid number of root, one allowed'
    }
} catch (error) {
    console.error('[RUNTIME ERROR]', error)
}
