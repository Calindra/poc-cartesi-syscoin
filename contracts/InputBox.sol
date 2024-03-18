// (c) Cartesi and individual authors (see AUTHORS)
// SPDX-License-Identifier: Apache-2.0 (see LICENSE)

pragma solidity ^0.8.0;


contract InputBox {
    event InputAdded(address indexed app, uint256 indexed index, bytes input);
    function addInput(
        address app,
        bytes calldata payload
    ) external returns (bytes32) {
        emit InputAdded(app, 0, payload);
        return keccak256(payload);
    }
}
