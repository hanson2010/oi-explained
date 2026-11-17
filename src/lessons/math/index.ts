import { assemble } from '../assemble'
import { FIRST } from './first'
import lessons from './lessons'
import { MATH } from './stories'
import { PRACTICE } from './practice'
import { REAL, TEXT } from './text'

export default assemble(lessons, TEXT, REAL, MATH, FIRST, PRACTICE)
