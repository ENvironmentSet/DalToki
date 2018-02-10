# DalToki
TTeok 언어의 Nodejs 기반의 ECMAScript 6+로 작성되어 있는 구현체입니다.

## TTeok
TTeok(떡)은 HTML의 문법을 개량한 객체 지향 프로그래밍 페러다임을 가진 언어입니다.

주로 웹 프론트엔드와 백엔드에서 사용될 예정입니다.

더 자세한 정보는 [위키](https://github.com/ENvironmentSet/DalToki/wiki/TTeok)를 참조해주세요.

## Requirement
* Nodejs
* gcc

## Install

* Linux:
```
$ git clone https://github.com/ENvironmentSet/DalToki
$ cd DalToki/DalToki_executor
$ gcc -o DalToki DalToki.c
$ export PATH="$PATH:[레포 폴더]/DalToki_executor"
$ export DalToki_PATH="[레포 폴더]"
```

## Execute
```
$ DalToki [TTeok프로그램 폴더]
```

## Example
```
$ DalToki $DalToki_PATH/test_code
DalToki, the TTeok Interpreter
Made By ENvironmentSet
Running...
[1 ,2 ,3 ,4 ,]
```
