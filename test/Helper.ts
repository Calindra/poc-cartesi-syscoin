import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

export class Helper {

    static async createGameHub() {
        const GameHub = await ethers.getContractFactory("GameHub");
        const gameHub = await GameHub.deploy();
        await gameHub.deployed();
        return gameHub;
    }

    static async createStartedGame(playerA: SignerWithAddress, playerB: SignerWithAddress) {
        const gameHub = await Helper.createGameHub();

        const joinTx = await gameHub.connect(playerA).joinGame();
        await joinTx.wait();

        const joinTx2 = await gameHub.connect(playerB).joinGame();
        await joinTx2.wait();
        return gameHub;
    }
}
