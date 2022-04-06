//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract MsgParams {
    address public owner;
    uint public fund;

    constructor() {
        owner = msg.sender;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function setNewOwner(address _owner) public {
        require(msg.sender == owner, "owner only");
        owner = _owner;
    }

    function deposit() public payable {
        fund += msg.value;
    }

    function getFunds() public view returns (uint) {
        return fund;
    }
}
