import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("GameHub", () => {

  describe('.joinGame()', () => {

    it("Should deny the same address to start 2 games at same time - A player", async () => {
      const [owner] = await ethers.getSigners();
      const GameHub = await ethers.getContractFactory("GameHub");
      const gameHub = await GameHub.deploy();
      await gameHub.deployed();

      const joinTx = await gameHub.connect(owner).joinGame();
      await joinTx.wait();

      const error = await gameHub.connect(owner).joinGame().catch(e => e);
      expect(error.message).to.include('AlreadyJoiningGame');
    });

    it("Should deny the same address to join - B player", async () => {
      const [owner, addr1] = await ethers.getSigners();
      const GameHub = await ethers.getContractFactory("GameHub");
      const gameHub = await GameHub.deploy();
      await gameHub.deployed();

      const joinTx = await gameHub.connect(owner).joinGame();
      await joinTx.wait();

      const joinTx2 = await gameHub.connect(addr1).joinGame();
      await joinTx2.wait();

      const error = await gameHub.connect(addr1).joinGame().catch(e => e);
      expect(error.message).to.include('AlreadyJoinedAsPlayerB');
    });

    it("Should deny the same address to join again - A player", async () => {
      const [owner, addr1] = await ethers.getSigners();
      const GameHub = await ethers.getContractFactory("GameHub");
      const gameHub = await GameHub.deploy();
      await gameHub.deployed();

      const joinTx = await gameHub.connect(owner).joinGame();
      await joinTx.wait();

      const joinTx2 = await gameHub.connect(addr1).joinGame();
      await joinTx2.wait();

      const error = await gameHub.connect(owner).joinGame().catch(e => e);
      expect(error.message).to.include('AlreadyJoinedAsPlayerA');
    });

    it("Should start a Game", async () => {
      const [owner, addr1] = await ethers.getSigners();
      const GameHub = await ethers.getContractFactory("GameHub");
      const gameHub = await GameHub.deploy();
      await gameHub.deployed();

      const joinTx = await gameHub.connect(owner).joinGame();
      await joinTx.wait();

      const joinTx2 = await gameHub.connect(addr1).joinGame();
      await joinTx2.wait();

      const game = await gameHub.connect(owner).myGame();
      expect(game[0]).to.equal(0);
      expect(game[1]).to.equal(0);
      expect(game[2]).to.equal(owner.address);
      expect(game[3]).to.equal(addr1.address);

      // o player B tb pode ler o jogo
      const game2 = await gameHub.connect(addr1).myGame();
      expect(game2[0]).to.equal(0);
      expect(game2[1]).to.equal(0);
      expect(game2[2]).to.equal(owner.address);
      expect(game2[3]).to.equal(addr1.address);
    });

  });

  describe('.setGameResult()', () => {
    it("Should throw an error when game is not started and the owner try to set the results", async () => {
      const [owner] = await ethers.getSigners();
      const GameHub = await ethers.getContractFactory("GameHub");
      const gameHub = await GameHub.deploy();
      await gameHub.deployed();
      const error = await gameHub.connect(owner).setGameResult(3, 1, owner.address).catch(e => e);
      expect(error.message).to.include('GameNotStarted');
    });
  
    it("Should throw an error when a common user try to set the results", async () => {
      const [owner, addr1] = await ethers.getSigners();
      const GameHub = await ethers.getContractFactory("GameHub");
      const gameHub = await GameHub.deploy();
      await gameHub.deployed();
      const error = await gameHub.connect(addr1).setGameResult(3, 1, owner.address).catch(e => e);
      expect(error.message).to.include('Forbidden');
    });
  
    it("Should set the game results", async () => {
      const [owner, addr1] = await ethers.getSigners();
      const gameHub = await Helper.createStartedGame(owner, addr1);
      const resTx = await gameHub.connect(owner).setGameResult(3, 1, owner.address);
      await resTx.wait();
  
      const game2 = await gameHub.connect(addr1).myGame();
      expect(game2[0]).to.equal(3);
      expect(game2[1]).to.equal(1);
      expect(game2[2]).to.equal(owner.address);
      expect(game2[3]).to.equal(addr1.address);
    });
  });

  describe(".bet()", () => {
    it("Should do a bet", async () => {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const gameHub = await Helper.createStartedGame(owner, addr1);

      const betTx = await gameHub.connect(addr2).bet(1, owner.address);
      await betTx.wait();
    });

    it("Should deny bets when the game isnt started", async () => {
      const [owner] = await ethers.getSigners();
      const gameHub = await Helper.createGameHub();
      const error = await gameHub.connect(owner).bet(1, owner.address).catch(e => e);
      expect(error.message).to.include('GameBetStatusError');
    });

    it("Should deny bets when the game is ended", async () => {
      const [owner, addr1] = await ethers.getSigners();
      const gameHub = await Helper.createStartedGame(owner, addr1);
      const resTx = await gameHub.connect(owner).setGameResult(3, 1, owner.address);
      await resTx.wait();

      const error = await gameHub.connect(owner).bet(1, owner.address).catch(e => e);
      expect(error.message).to.include('GameBetStatusError');
    });

    it("Should do a bet, set game results and get the prize", async () => {
      const [owner, addr1, addr2, addr3] = await ethers.getSigners();
      const gameHub = await Helper.createStartedGame(owner, addr1);
      const betTx1 = await gameHub.connect(addr2).bet(1, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx1.wait();

      const betTx2 = await gameHub.connect(addr3).bet(2, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx2.wait();

      const resTx = await gameHub.connect(owner).setGameResult(3, 1, owner.address);
      await resTx.wait();

      const balance1 = await ethers.provider.getBalance(addr2.address);
      const withdrawTx = await gameHub.connect(addr2).withdraw(owner.address);
      await withdrawTx.wait();

      // esperamos que tenha ganho 1.6 menos as taxas
      const minBalanceExpected = balance1.add(ethers.utils.parseEther('1.59'));

      const balance = await ethers.provider.getBalance(addr2.address);
      expect(balance.gt(minBalanceExpected)).to.be.true;

      // nao pode sacar de novo
      const error = await gameHub.connect(addr2).withdraw(owner.address).catch(e => e);
      expect(error.message).to.includes('NothingToWithdraw');
    });

    it("Should do a bet, set game results and get the prize - proportional", async () => {
      const [owner, addr1, addr2, addr3] = await ethers.getSigners();
      const gameHub = await Helper.createStartedGame(owner, addr1);
      const betTx1 = await gameHub.connect(addr2).bet(1, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx1.wait();

      const betTx2 = await gameHub.connect(addr3).bet(2, owner.address, { value: ethers.utils.parseEther('2') });
      await betTx2.wait();

      const betTx3 = await gameHub.connect(addr3).bet(1, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx3.wait();

      const resTx = await gameHub.connect(owner).setGameResult(3, 1, owner.address);
      await resTx.wait();

      const balance1 = await ethers.provider.getBalance(addr2.address);
      const withdrawTx = await gameHub.connect(addr2).withdraw(owner.address);
      await withdrawTx.wait();

      // esperamos que tenha ganho 1.6 menos as taxas
      const minBalanceExpected = balance1.add(ethers.utils.parseEther('1.59'));

      const balance = await ethers.provider.getBalance(addr2.address);
      expect(balance.gt(minBalanceExpected)).to.be.true;

      // nao pode sacar de novo
      const error = await gameHub.connect(addr2).withdraw(owner.address).catch(e => e);
      expect(error.message).to.includes('NothingToWithdraw');
    });

    it("Should do a bet, set game results and get the prize - B wins", async () => {
      const [owner, addr1, addr2, addr3] = await ethers.getSigners();
      const gameHub = await Helper.createStartedGame(owner, addr1);
      const betTx1 = await gameHub.connect(addr2).bet(1, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx1.wait();

      const betTx2 = await gameHub.connect(addr3).bet(2, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx2.wait();

      const resTx = await gameHub.connect(owner).setGameResult(1, 2, owner.address);
      await resTx.wait();

      const balance1 = await ethers.provider.getBalance(addr3.address);
      const withdrawTx = await gameHub.connect(addr3).withdraw(owner.address);
      await withdrawTx.wait();

      // esperamos que tenha ganho 1.6 menos as taxas
      const minBalanceExpected = balance1.add(ethers.utils.parseEther('1.59'));

      const balance = await ethers.provider.getBalance(addr3.address);
      expect(balance.gt(minBalanceExpected)).to.be.true;

      // nao pode sacar de novo
      const error = await gameHub.connect(addr3).withdraw(owner.address).catch(e => e);
      expect(error.message).to.includes('NothingToWithdraw');
    });

    it("Should do a bet, set game results and get the prize - B wins A zero", async () => {
      const [owner, addr1, addr2, addr3] = await ethers.getSigners();
      const gameHub = await Helper.createStartedGame(owner, addr1);
      const betTx1 = await gameHub.connect(addr2).bet(1, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx1.wait();

      const betTx2 = await gameHub.connect(addr3).bet(4, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx2.wait();

      const resTx = await gameHub.connect(owner).setGameResult(0, 2, owner.address);
      await resTx.wait();

      const balance1 = await ethers.provider.getBalance(addr3.address);
      const withdrawTx = await gameHub.connect(addr3).withdraw(owner.address);
      await withdrawTx.wait();

      // esperamos que tenha ganho 1.6 menos as taxas
      const minBalanceExpected = balance1.add(ethers.utils.parseEther('1.59'));

      const balance = await ethers.provider.getBalance(addr3.address);
      expect(balance.gt(minBalanceExpected)).to.be.true;

      // nao pode sacar de novo
      const error = await gameHub.connect(addr3).withdraw(owner.address).catch(e => e);
      expect(error.message).to.includes('NothingToWithdraw');
    });

    it("Should do a bet, set game results and get the prize - A wins B zero", async () => {
      const [owner, addr1, addr2, addr3] = await ethers.getSigners();
      const gameHub = await Helper.createStartedGame(owner, addr1);
      const betTx1 = await gameHub.connect(addr2).bet(1, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx1.wait();

      const betTx2 = await gameHub.connect(addr3).bet(3, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx2.wait();

      const resTx = await gameHub.connect(owner).setGameResult(1, 0, owner.address);
      await resTx.wait();

      const balance1 = await ethers.provider.getBalance(addr3.address);
      const withdrawTx = await gameHub.connect(addr3).withdraw(owner.address);
      await withdrawTx.wait();

      // esperamos que tenha ganho 1.6 menos as taxas
      const minBalanceExpected = balance1.add(ethers.utils.parseEther('1.59'));

      const balance = await ethers.provider.getBalance(addr3.address);
      expect(balance.gt(minBalanceExpected)).to.be.true;

      // nao pode sacar de novo
      const error = await gameHub.connect(addr3).withdraw(owner.address).catch(e => e);
      expect(error.message).to.includes('NothingToWithdraw');
    });

    it("Should do a bet, set game results and get the prize - draw 0x0", async () => {
      const [owner, addr1, addr2, addr3] = await ethers.getSigners();
      const gameHub = await Helper.createStartedGame(owner, addr1);
      const betTx1 = await gameHub.connect(addr2).bet(1, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx1.wait();

      const betTx2 = await gameHub.connect(addr3).bet(5, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx2.wait();

      const resTx = await gameHub.connect(owner).setGameResult(0, 0, owner.address);
      await resTx.wait();

      const balance1 = await ethers.provider.getBalance(addr3.address);
      const withdrawTx = await gameHub.connect(addr3).withdraw(owner.address);
      await withdrawTx.wait();

      // esperamos que tenha ganho 1.6 menos as taxas
      const minBalanceExpected = balance1.add(ethers.utils.parseEther('1.59'));

      const balance = await ethers.provider.getBalance(addr3.address);
      expect(balance.gt(minBalanceExpected)).to.be.true;

      // nao pode sacar de novo
      const error = await gameHub.connect(addr3).withdraw(owner.address).catch(e => e);
      expect(error.message).to.includes('NothingToWithdraw');
    });

    it("Should do a bet, set game results and get the prize - draw 1x1", async () => {
      const [owner, addr1, addr2, addr3] = await ethers.getSigners();
      const gameHub = await Helper.createStartedGame(owner, addr1);
      const betTx1 = await gameHub.connect(addr2).bet(1, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx1.wait();

      const betTx2 = await gameHub.connect(addr3).bet(6, owner.address, { value: ethers.utils.parseEther('1') });
      await betTx2.wait();

      const resTx = await gameHub.connect(owner).setGameResult(1, 1, owner.address);
      await resTx.wait();

      const balance1 = await ethers.provider.getBalance(addr3.address);
      const withdrawTx = await gameHub.connect(addr3).withdraw(owner.address);
      await withdrawTx.wait();

      // esperamos que tenha ganho 1.6 menos as taxas
      const minBalanceExpected = balance1.add(ethers.utils.parseEther('1.59'));

      const balance = await ethers.provider.getBalance(addr3.address);
      expect(balance.gt(minBalanceExpected)).to.be.true;

      // nao pode sacar de novo
      const error = await gameHub.connect(addr3).withdraw(owner.address).catch(e => e);
      expect(error.message).to.includes('NothingToWithdraw');
    });
  });

});

class Helper {

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