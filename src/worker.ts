import { level1AI } from "./ai";
import { alphabeta } from "./ai2";

onmessage = (e) => {
  const {pieces, turn, adversary} = e.data;
  const output =
    adversary === 'level1'
    ? level1AI(pieces, turn)
    : adversary === 'level2'
    ? alphabeta(4, turn, -Infinity, +Infinity, pieces)[1]
    : alphabeta(8, turn, -Infinity, +Infinity, pieces)[1]          
  postMessage(output);
}