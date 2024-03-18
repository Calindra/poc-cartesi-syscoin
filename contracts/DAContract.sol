// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
// import "hardhat/console.sol";

interface PodaContractInterface {
    function podaMap(bytes32 _key) external view returns (bool);
}

/**
 * @title DAContract
 * @dev Store & retrieve value in a variable
 */
contract DAContract {
    event InputAdded(address indexed app, uint256 indexed index, bytes input);
    // event ValueChanged(address indexed _original_sender, );
    //
    function checkPodaMap(
        address batchInboxAddress,
        string memory _str,
        address inputBoxAddress,
        address app,
        bytes calldata payload,
        bytes32 podaHash
    ) external returns (address) {
        PodaContractInterface l2bi = PodaContractInterface(batchInboxAddress);
        bytes32 poda = keccak256(abi.encodePacked(_str));
        bool ok = l2bi.podaMap(poda);
        require(ok, "Data not found");

        string memory podaHashStr = bytes32ToHex(podaHash);
        // Concatenate the strings into a JSON-like structure
        string memory json = string(
            abi.encodePacked("{\"data_push\":{\"hash\":\"", podaHashStr, "\"}}")
        );

        // Convert the string to bytes
        bytes memory jsonBytes = bytes(json);
        // delegated call to the InputBox
        // Perform a delegated call to contract A's setValue function
        (bool success, bytes memory result) = inputBoxAddress.delegatecall(
            abi.encodeWithSignature("addInput(address,bytes)", app, payload)
        );
        require(success, "Delegated call failed");
        emit InputAdded(app, 0, jsonBytes);
        return abi.decode(result, (address));
    }

    function bytes32ToHex(bytes32 data) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory hexData = new bytes(64);

        for (uint i = 0; i < 32; i++) {
            hexData[i * 2] = hexChars[uint8(data[i] >> 4)];
            hexData[i * 2 + 1] = hexChars[uint8(data[i] & 0x0f)];
        }

        return string(hexData);
    }
}
