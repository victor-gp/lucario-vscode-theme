# frozen_string_literal: true

# https://adventofcode.com/2021/day/5

require 'set'

def main(part)
  input = File.open('../../input/day05-in.txt', &:read)
  lines = input.lines.map { |line_s| Line.from_s(line_s) }

  lines.filter! { |l| !l.diagonal? } if part == 1

  line_pairs = lines.product(lines).filter { |l1, l2| l1 != l2 }
  overlap_points =
    line_pairs.inject(Set.new) do |acc, pair|
      overlap = pair[0].overlap(pair[1])
      acc.merge(overlap)
    end
  puts overlap_points.length
end

# todo: in Atom, Line is green + underline.
#       I like the <u> very much, but only on declaration.
class Line
  attr_reader :a_coord, :b_coord

  def initialize(a_coord, b_coord)
    @a_coord = a_coord
    @b_coord = b_coord
  end

  def self.from_s(line_s)
    # ex: 88,177 -> 566,655
    coord_s_ary = line_s.split(' -> ')
    a, b = coord_s_ary.map do |coord_s|
      _x, _y = coord_s.split(',').map(&:to_i)
    end
    Line.new(a, b)
  end

  def diagonal?
    a_coord[0] != b_coord[0] && a_coord[1] != b_coord[1]
  end

  def overlap(other_line)
    point_set.intersection(other_line.point_set)
  end

  def point_set
    @point_set ||= point_set_inner
  end

  def point_set_inner
    x_range = self.class.range_1D(a_coord[0], b_coord[0])
    y_range = self.class.range_1D(a_coord[1], b_coord[1])
    Set.new(
      if diagonal? # both ranges are of the same length
        x_range.zip(y_range)
      else # one of the two ranges is a single point
        x_range.product(y_range)
      end
    )
  end

  def self.range_1D(a, b)
    min, max = [a, b].sort
    range = (min..max).to_a
    range.reverse! if min != a
    range
  end
end


bad_argc = 'Santa says: "this program uses a single argument. we give out stars on channels 1 and 2."'
bad_arg1 = 'Santa says: "there\'s nothing here, you may want to try on channels 1 or 2."'

if ARGV.length != 1
  abort bad_argc
elsif ![1, 2].include? ARGV[0].to_i
  abort bad_arg1
end

main(ARGV[0].to_i)
