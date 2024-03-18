import { expect } from "chai";
import { ethers } from "hardhat";
import { Helper } from "../Helper";


describe("DAContract", () => {

    describe('.checkPodaMap()', () => {
        it("Should deny the same address to start 2 games at same time - A player", async () => {
            // const [owner] = await ethers.getSigners();
            const L2BatchInbox = await ethers.getContractFactory("L2BatchInbox");
            const l2BatchInbox = await L2BatchInbox.deploy();
            await l2BatchInbox.deployed();

            l2BatchInbox.addToPodaMap("podaValue");
            // hash for "podaValue"
            const podaHash = '0xe1384435bca25dc100272f0b8bb6088489db19923c50639565ba564ccc13b85f'
            // wrong hash for "podaValue"
            const podaHashFake = '0xe1384435bca25dc100272f0b8bb6088489db19923c50639565ba564ccc13b85e'

            const InputBox = await ethers.getContractFactory("InputBox");
            const inputBox = await InputBox.deploy();
            await inputBox.deployed();

            const DAContract = await ethers.getContractFactory("DAContract");
            const daContract = await DAContract.deploy();
            await daContract.deployed();

            const tx = await daContract.checkPodaMap(l2BatchInbox.address, inputBox.address, inputBox.address, podaHash);
            console.log(tx)
            const r = await tx.wait();
            console.log('events', r.events)

            const e = await daContract
                .checkPodaMap(l2BatchInbox.address, inputBox.address, inputBox.address, podaHashFake)
                .catch(e => e);
            console.log(e.message)
            expect(e.message).to.include("Data not found")
        });
    })
});
