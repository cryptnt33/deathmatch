//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./OwnableExt.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Deathmatch is OwnableExt {
    using Counters for Counters.Counter;
    Counters.Counter private gameId;

    enum MatchStatus {
        NotStarted,
        Started,
        Finished
    }

    struct MatchInfo {
        MatchStatus matchStatus;
        uint timeStarted;
    }

    mapping(uint => MatchInfo) private matches;

    event MatchStarted(uint, uint);

    constructor() {}

    function startMatch() external onlyOwner {
        gameId.increment();
        uint currentId = gameId.current();
        uint timestamp = block.timestamp;
        matches[currentId] = MatchInfo(MatchStatus.Started, timestamp);
        emit MatchStarted(currentId, timestamp);
    }

    function getMatchStatus(uint _gameId) public view returns (MatchStatus) {
        return matches[_gameId].matchStatus;
    }
}
