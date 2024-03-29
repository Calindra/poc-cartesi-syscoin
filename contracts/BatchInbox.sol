// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @custom:proxied
 * @title BatchInbox
 * @notice Calldata entries of version hashes which are checked against the precompile of blobs to verify they exist
 */
// slither-disable-next-line locked-ether
contract BatchInbox {
    
    
    /**
     * @notice appends an array of valid version hashes to the chain, each VH is checked via the VH precompile.
     *
     */
    function appendSequencerBatch(bytes32[] calldata _versionHashes) external view {
        
    }

    /**
     * @notice appends an array of valid version hashes to the chain and sends message to L2BatchInbox, each VH is checked via the VH precompile.
     *
     * @param _target L2 contract where message will be received with PoDA hashes.
     * @param _selector The function selector inside the L2 contract
     * @param _versionHashes Array of keccak256 version hashes in segments of 32 bytes each
     */
    function appendSequencerBatchToL2(address _target, bytes calldata _selector, bytes32[] calldata _versionHashes) external {
    }
}