//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnableExt is Ownable {
    mapping(address => uint8) private delegators;

    function isOwner(address _address) public view returns (bool) {
        return _address == owner();
    }

    function addDelegator(address _delegator) external onlyOwner {
        delegators[_delegator] = 1;
    }

    function isDelegator(address _delegator) internal view returns (bool) {
        return delegators[_delegator] == 1;
    }

    modifier ownerOrDelegator() {
        require(
            isOwner(_msgSender()) || isDelegator(_msgSender()),
            "only owner or delegator"
        );
        _;
    }
}
