// https://adventofcode.com/2021/day/2

use std::env;
use std::error::Error;
use std::fs::File;
use std::io::{prelude::*, BufReader};
use std::str::FromStr;

fn main() {
    let argv: Vec<String> = env::args().collect();
    let arg1 = argv[1].parse::<u8>().expect("error parsing argv[1]");
    let input_file = File::open("../../input/day02-in.txt").expect("error opening input file");
    let input_reader = BufReader::new(input_file);
    let commands_iter = input_reader.lines().map(|line| {
        line.expect("error when unwrapping a line")
            .parse::<Command>()
            .expect("error when parsing a Command str")
    });
    if arg1 == 1 {
        part1(commands_iter);
    } else if arg1 == 2 {
        part2(commands_iter);
    } else {
        eprintln!("Santa says: \"there's nothing here, you may want to try on channels 1 or 2.\"")
    }
}

fn part1(commands_iter: impl Iterator<Item = Command>) {
    let starting_pos = Position { horizontal: 0, depth: 0 };
    let eval_cmd = |pos: Position, cmd| pos.after_command(&cmd);
    let final_pos = commands_iter.fold(starting_pos, eval_cmd);

    eprintln!("final position: {:?}", final_pos);
    println!("{}", final_pos.horizontal * final_pos.depth);
}

fn part2(commands_iter: impl Iterator<Item = Command>) {
    let starting_state = State { horizontal: 0, depth: 0, aim: 0 };
    let eval_cmd = |state: State, cmd| state.after_command(&cmd);
    let final_state = commands_iter.fold(starting_state, eval_cmd);

    eprintln!("final state: {:?}", final_state);
    println!("{}", final_state.horizontal * final_state.depth);
}

type Units = u32;

#[derive(Debug)]
struct Position {
    horizontal: Units,
    depth: Units,
}

#[derive(Debug)]
struct State {
    horizontal: Units,
    depth: Units,
    aim: Units,
}

enum Command {
    Forward(Units),
    Down(Units),
    Up(Units),
}

impl Position {
    fn after_command(self, cmd: &Command) -> Position {
        match cmd {
            Command::Forward(units) => Position {
                horizontal: self.horizontal + units,
                ..self
            },
            Command::Down(units) => Position {
                depth: self.depth + units,
                ..self
            },
            Command::Up(units) => Position {
                depth: self.depth - units,
                ..self
            },
        }
    }
}

impl State {
    fn after_command(self, cmd: &Command) -> State {
        match cmd {
            Command::Forward(units) => State {
                horizontal: self.horizontal + units,
                depth: self.depth + self.aim * units,
                ..self
            },
            Command::Down(units) => State {
                aim: self.aim + units,
                ..self
            },
            Command::Up(units) => State {
                aim: self.aim - units,
                ..self
            },
        }
    }
}

impl FromStr for Command {
    type Err = Box<dyn Error>;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let tokens: Vec<&str> = s.split_whitespace().collect();
        let units = tokens[1].parse::<Units>()?;
        let command = match tokens[0] {
            "forward" => Command::Forward(units),
            "down" => Command::Down(units),
            "up" => Command::Up(units),
            _ => panic!("unrecognized command verb"),
        };
        Ok(command)
    }
}
