//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnableExt is Ownable {
    function isOwner(address _address) public view returns (bool) {
        return _address == owner();
    }
}
