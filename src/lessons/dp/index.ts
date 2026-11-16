import { assemble } from '../assemble'
import lessons from './lessons'
import { DP } from './stories'
import { REAL, TEXT } from './text'

export default assemble(lessons, TEXT, REAL, DP)
