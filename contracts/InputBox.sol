// (c) Cartesi and individual authors (see AUTHORS)
// SPDX-License-Identifier: Apache-2.0 (see LICENSE)

pragma solidity ^0.8.0;


contract InputBox {
    function addInput(
        address app,
        bytes calldata payload
    ) external returns (address) {
        return msg.sender;
    }
}
