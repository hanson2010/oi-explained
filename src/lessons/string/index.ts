import { assemble } from '../assemble'
import { FIRST } from './first'
import lessons from './lessons'
import { STRING } from './stories'
import { PRACTICE } from './practice'
import { REAL, TEXT } from './text'

export default assemble(lessons, TEXT, REAL, STRING, FIRST, PRACTICE)
