import { assemble } from '../assemble'
import lessons from './lessons'
import { SORT } from './stories'
import { PRACTICE } from './practice'
import { REAL, TEXT } from './text'

export default assemble(lessons, TEXT, REAL, SORT, {}, PRACTICE)
