// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract L2BatchInbox {
    mapping(bytes32 => bool) public podaMap;

    constructor() {
        podaMap[keccak256("poda")] = true;
    }

    function addToPodaMap(string memory _str) external {
        podaMap[keccak256(abi.encodePacked(_str))] = true;
    }
}
