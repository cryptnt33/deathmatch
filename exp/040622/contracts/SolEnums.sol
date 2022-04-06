//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract SolEnums {
    address public owner;
    ValidStates public currentState;

    enum ValidStates {
        NotStarted,
        Started,
        Finished
    }

    constructor() {
        owner = msg.sender;
    }

    function setState(ValidStates _state) public {
        currentState = _state;
    }

    function getState() public view returns (ValidStates) {
        return currentState;
    }
}
