import { expect } from "chai";
import { ethers } from "hardhat";

describe("DAContract", () => {
  describe(".sendDataHash()", () => {
    it("should send the syscoin hash and verify it", async () => {
      const L2BatchInbox = await ethers.getContractFactory("L2BatchInbox");
      const l2BatchInbox = await L2BatchInbox.deploy();
      await l2BatchInbox.deployed();

      await l2BatchInbox.addToPodaMap("podaValue");

      // hash for "podaValue"
      const podaHash =
        "0xe1384435bca25dc100272f0b8bb6088489db19923c50639565ba564ccc13b85f";

      // wrong hash for "podaValue"
      const podaHashFake =
        "0xe1384435bca25dc100272f0b8bb6088489db19923c50639565ba564ccc13b85e";

      const InputBox = await ethers.getContractFactory("InputBox");
      const inputBox = await InputBox.deploy();
      await inputBox.deployed();

      const filter = inputBox.filters.InputAdded();
      let payload: string = "0x";
      const promise = new Promise((resolve) => {
        inputBox.on(filter, (_a, _b, _payload, ...args) => {
          payload = _payload;
          resolve(args);
        });
      });

      const DAContract = await ethers.getContractFactory("DAContract");
      const daContract = await DAContract.deploy(
        l2BatchInbox.address,
        inputBox.address
      );
      await daContract.deployed();

      const tx = await daContract.sendDataHash(inputBox.address, podaHash);
      await tx.wait();

      const e = await daContract
        .sendDataHash(inputBox.address, podaHashFake)
        .catch((e) => e);
      expect(e.message).to.include("Data not found");

      // verify the Event
      await promise;
      const decodedString = Buffer.from(payload.slice(2), "hex").toString();
      const json = JSON.parse(decodedString);
      expect(json.data_push.hash).to.eq(podaHash.slice(2));
    });
  });
});
