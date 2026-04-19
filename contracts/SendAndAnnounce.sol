// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.32;

interface IAnnounce {
    function announce(uint256 schemeId, address stealthAddress, bytes memory ephemeralPubKey, bytes memory metadata) external;
}

contract SendAndAnnounce {
    address announcerAddress = 0x55649E01B5Df198D18D95b5cc5051630cfD45564;

    function sendAndAnnounce(
        uint256 schemeId,
        address stealthAddress,
        bytes memory ephemeralPubKey,
        bytes memory metadata
    ) external payable {
        // Pay the stealth address
        (bool success, ) = stealthAddress.call{value: msg.value}("");
        require(success, "Failed to send Ether");

        // Announce the transaction
        IAnnounce(announcerAddress).announce(schemeId, stealthAddress, ephemeralPubKey, metadata);
    }
}