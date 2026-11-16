import { assemble } from '../assemble'
import { FIRST } from './first'
import lessons from './lessons'
import { SEARCH } from './stories'
import { REAL, TEXT } from './text'

export default assemble(lessons, TEXT, REAL, SEARCH, FIRST)
