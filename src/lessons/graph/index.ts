import { assemble } from '../assemble'
import { FIRST } from './first'
import lessons from './lessons'
import { GRAPH1 } from './stories1'
import { GRAPH2 } from './stories2'
import { REAL, TEXT } from './text'

export default assemble(lessons, TEXT, REAL, { ...GRAPH1, ...GRAPH2 }, FIRST)
