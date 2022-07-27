// https://adventofcode.com/2021/day/4

import scala.io.Source
import scala.collection.immutable.HashMap
import scala.collection.mutable.ArraySeq

// todo: rewrite this in the style of Day07: with brackets, an object for each part, etc.

@main def day04(part: Int): Unit =
  val bufferedSource = Source.fromFile("../../input/day04-in.txt")
  val input = bufferedSource.mkString
  bufferedSource.close

  val blocks = input.split("\n\n")
  val numbers = blocks.head.split(',').toList.map(_.toInt)
  val boards = blocks.toList.tail.map(BingoBoard.fromString(_))

  part match
    case 1 => part1(numbers, boards)
    case 2 => part2(numbers, boards)
    case _ => print(santa_says)

val santa_says = "Santa says: \"there\'s nothing here, you may want to try on channels 1 or 2.\""

def part1(numbers: List[Int], boards: List[BingoBoard]): Unit =
  val (winningBoard, bingoNum) = play(boards, numbers)
  println(winningBoard.score(bingoNum))

def play(boards: List[BingoBoard], numbers: List[Int]): (BingoBoard, Int) =
  val nextNum = numbers.head
  val includingNum = boards.filter(_.includes(nextNum))
  includingNum.foreach(_.markNumber(nextNum))

  val winnerOpt = includingNum.find(_.hasWonAfter(nextNum))
  winnerOpt match
    case Some(winner) => (winner, nextNum)
    case None => play(boards, numbers.tail)


def part2(numbers: List[Int], boards: List[BingoBoard]): Unit =
  val (losingBoard, bingoNum) = playToLose(boards, numbers)
  println(losingBoard.score(bingoNum))

def playToLose(boards: List[BingoBoard], numbers: List[Int]): (BingoBoard, Int) =
  // todo: rewrite this with an early base case (if boards.length == 1), and simplify the tail if/else
  // or maybe not? cause I need the winning num? Do I ship that away into another method?
  val nextNum = numbers.head
  val includingNum = boards.filter(_.includes(nextNum))
  includingNum.foreach(_.markNumber(nextNum))
  val complete = includingNum.filter(_.hasWonAfter(nextNum))
  val incomplete = boards.filter(! complete.contains(_))

  if incomplete.length == 0 then
    (complete.head, nextNum)
  else
    playToLose(incomplete, numbers.tail)


type Pos2D = (Int, Int)
type Grid[T] = ArraySeq[ArraySeq[T]]

class BingoBoard(val numToPos: HashMap[Int, Pos2D], var marked: Grid[Boolean]):
  import BingoBoard.*

  def includes(num: Int): Boolean = numToPos.contains(num)

  // pre: the board includes num
  // post: mutates marked
  def markNumber(num: Int): Unit =
    val (row, col) = numToPos(num)
    marked(row)(col) = true

  // pre: the board includes num
  def hasWonAfter(num: Int): Boolean =
    val (row, col) = numToPos(num)
    isCompleteRow(row) || isCompleteColumn(col)

  def isCompleteRow(row: Int): Boolean = marked(row).forall(_ == true)

  def isCompleteColumn(col: Int): Boolean = marked.map(_(col)).forall(_ == true)

  def score(bingoNum: Int): Int =
    val unmarkedNums =
      for
        num <- numToPos.keys
        (row, col) = numToPos(num)
        if ! marked(row)(col)
      yield
        num
    unmarkedNums.sum * bingoNum

object BingoBoard:
  // boards are always 5x5
  val sideLength: Int = 5

  def fromString(grid: String): BingoBoard =
    val numToPos = HashMap.from(
      for
        (row, i) <- grid.linesIterator.zipWithIndex
        (numStr, j) <- row.trim.split("\\s+").zipWithIndex
      yield
        (numStr.toInt, (i, j))
    )
    val marked = ArraySeq.fill(sideLength, sideLength){ false }
    BingoBoard(numToPos, marked)
