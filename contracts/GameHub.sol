// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "hardhat/console.sol";

struct Game {
    uint endAt;
    uint8 status;
    uint8 goalsA;
    uint8 goalsB;
    address playerA;
    address playerB;
    uint256 balance;

    uint256 totAWins;
    uint256 totBWins;
    uint256 totAWinsZeroCon;
    uint256 totBWinsZeroCon;
    uint256 totDrawZero;
    uint256 totDrawWithGoals;

    mapping(address => uint256) aWins;
    mapping(address => uint256) bWins;
    mapping(address => uint256) aWinsZeroCon;
    mapping(address => uint256) bWinsZeroCon;
    mapping(address => uint256) drawZero;
    mapping(address => uint256) drawWithGoals;
}

struct PreGame {
    address playerA;
    address playerB;
}

/**
 * @title GameHub
 * @dev Store & retrieve value in a variable
 */
contract GameHub {
    event FilledA();
    event Filled();

    mapping(address => Game) private playing;
    mapping(address => address) private playerB;

    PreGame private makingGame;

    address private owner;

    constructor() {
        owner = msg.sender;
    }

    function joinGame() external {
        require(makingGame.playerA != msg.sender, "AlreadyJoiningGame");
        Game storage gameCheck = playing[msg.sender];
        require(gameCheck.status == 0, "AlreadyJoinedAsPlayerA");
        gameCheck = playing[playerB[msg.sender]];
        require(gameCheck.status == 0, "AlreadyJoinedAsPlayerB");
        if (makingGame.playerA == address(0)) {
            makingGame.playerA = msg.sender;
            emit FilledA();
        } else if (makingGame.playerB == address(0)) {
            makingGame.playerB = msg.sender;
            playerB[makingGame.playerB] = makingGame.playerA;
            Game storage game = playing[makingGame.playerA];
            game.playerA = makingGame.playerA;
            game.playerB = makingGame.playerB;
            game.status = 1;
            emit Filled();
            makingGame.playerA = address(0);
            makingGame.playerB = address(0);
        }
    }

    function myGame() external view returns (uint8, uint8, address, address) {
        Game storage game = playing[msg.sender];
        if (game.status == 0) {
            game = playing[playerB[msg.sender]];
        }
        return (game.goalsA, game.goalsB, game.playerA, game.playerB);
    }

    /**
     * Faz uma aposta
     */
    function bet(uint bettype, address player) external payable {
        Game storage game = playing[player];
        require(game.status != 9, "GameBetStatusError");
        require(game.status != 0, "GameBetStatusError");
        if (bettype == 1) {
            game.aWins[msg.sender] += msg.value;
            game.totAWins += msg.value;
        } else if (bettype == 2) {
            game.bWins[msg.sender] += msg.value;
            game.totBWins += msg.value;
        } else if (bettype == 3) {
            game.aWinsZeroCon[msg.sender] += msg.value;
            game.totAWinsZeroCon += msg.value;
        } else if (bettype == 4) {
            game.bWinsZeroCon[msg.sender] += msg.value;
            game.totBWinsZeroCon += msg.value;
        } else if (bettype == 5) {
            game.drawZero[msg.sender] += msg.value;
            game.totDrawZero += msg.value;
        } else if (bettype == 6) {
            game.drawWithGoals[msg.sender] += msg.value;
            game.totDrawWithGoals += msg.value;
        }
        game.balance += msg.value;
    }

    function setGameResult(uint8 goalsA, uint8 goalsB, address playerA) external {
        require(msg.sender == owner, "Forbidden");
        Game storage game = playing[playerA];
        require(game.status > 0, "GameNotStarted");
        game.goalsA = goalsA;
        game.goalsB = goalsB;
        game.status = 9;
    }

    function withdraw(address player) external payable {
        Game storage game = playing[player];
        require(game.status == 9, "NotFinalized");
        uint256 amount;
        if (game.goalsB > 0 && game.goalsA > game.goalsB) {
            amount = (game.balance / 5 * 4) * game.aWins[msg.sender] / game.totAWins;
            game.aWins[msg.sender] = 0;
        } else if (game.goalsA > 0 && game.goalsB > game.goalsA) {
            amount = (game.balance / 5 * 4) * game.bWins[msg.sender] / game.totBWins;
            game.bWins[msg.sender] = 0;
        } else if (game.goalsA == 0 && game.goalsB > game.goalsA) {
            amount = (game.balance / 5 * 4) * game.bWinsZeroCon[msg.sender] / game.totBWinsZeroCon;
            game.bWinsZeroCon[msg.sender] = 0;
        } else if (game.goalsB == 0 && game.goalsA > game.goalsB) {
            amount = (game.balance / 5 * 4) * game.aWinsZeroCon[msg.sender] / game.totAWinsZeroCon;
            game.aWinsZeroCon[msg.sender] = 0;
        } else if (game.goalsB == 0 && game.goalsA == 0) {
            amount = (game.balance / 5 * 4) * game.drawZero[msg.sender] / game.totDrawZero;
            game.drawZero[msg.sender] = 0;
        } else if (game.goalsB > 0 && game.goalsA == game.goalsB) {
            amount = (game.balance / 5 * 4) * game.drawWithGoals[msg.sender] / game.totDrawWithGoals;
            game.drawWithGoals[msg.sender] = 0;
        }
        require(amount > 0, "NothingToWithdraw");
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

}