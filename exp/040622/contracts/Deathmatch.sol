//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./OwnableExt.sol";

contract Deathmatch is OwnableExt {
    address payable private externalWallet;

    enum MatchStatus {
        NotStarted,
        Started,
        Finished
    }

    struct MatchInfo {
        MatchStatus matchStatus;
        uint timeStarted;
        uint floorPrice;
        uint maxSlots;
    }

    struct DepositInfo {
        uint depositAmount;
        uint slots;
        bool deposited;
    }

    mapping(string => MatchInfo) private matches;
    mapping(string => mapping(address => DepositInfo)) private deposits;
    mapping(string => address[]) private players;

    event MatchStarted(string, uint);
    event WalletChanged(address, address);
    event FeeDeposited(address, uint);

    constructor(address payable _wallet) OwnableExt() {
        externalWallet = _wallet;
    }

    /**
        functions
    */

    // only owners or delegators can start a match
    function startMatch(
        string calldata _gameId,
        uint _floorPrice,
        uint _maxSlots
    ) external ownerOrDelegator {
        uint timestamp = block.timestamp;
        MatchInfo memory info = matches[_gameId];
        require(
            info.matchStatus == MatchStatus.NotStarted,
            "match in-progress"
        );
        matches[_gameId] = MatchInfo(
            MatchStatus.Started,
            timestamp,
            _floorPrice,
            _maxSlots
        );
        emit MatchStarted(_gameId, timestamp);
    }

    // anyone can deposit fee
    function depositFee(string calldata _gameId, uint _slots) external payable {
        MatchInfo memory info = matches[_gameId];
        DepositInfo memory depositInfo = deposits[_gameId][msg.sender];
        require(info.matchStatus == MatchStatus.Started, "match not started");
        require(_slots >= 1 && _slots <= info.maxSlots, "slot limit exceeded");
        require(msg.value >= info.floorPrice * _slots, "insufficient deposit");
        require(!depositInfo.deposited, "re-entry not allowed");

        // transfer to the wallet address
        externalWallet.transfer(msg.value);
        deposits[_gameId][msg.sender] = DepositInfo(msg.value, _slots, true);
        emit FeeDeposited(msg.sender, msg.value);
    }

    // enter a match one or more times depending on the number of slots purchased
    // anyone can enter a match
    // can't enter a match without depositing fee
    function enterMatch(string calldata _gameId) external {
        MatchInfo storage matchInfo = matches[_gameId];
        DepositInfo storage depositInfo = deposits[_gameId][msg.sender];

        // match must be started
        require(
            matchInfo.matchStatus == MatchStatus.Started,
            "match not started"
        );

        // verify if deposit was called before entering
        require(depositInfo.deposited, "deposit required");

        // deposit should equal floor price * slots
        require(
            depositInfo.depositAmount >=
                depositInfo.slots * matchInfo.floorPrice,
            "insufficient deposit"
        );

        // enter match
        address[] storage _players = players[_gameId];

        // check for re-entry
        require(_players.length == 0, "re-entry not allowed");

        // add players by number of slots
        for (uint i = 0; i < depositInfo.slots; i++) {
            _players.push(msg.sender);
        }
        players[_gameId] = _players;
    }

    /**
        property getters/setters
    */

    function setWallet(address payable _wallet) external onlyOwner {
        address oldWallet = externalWallet;
        externalWallet = _wallet;
        emit WalletChanged(externalWallet, oldWallet);
    }

    function getMatchStatus(string calldata _gameId)
        external
        view
        returns (MatchStatus)
    {
        return matches[_gameId].matchStatus;
    }

    function getFloorPrice(string calldata _gameId)
        external
        view
        returns (uint)
    {
        return matches[_gameId].floorPrice;
    }

    function getDepositInfo(string calldata _gameId, address by)
        external
        view
        returns (DepositInfo memory)
    {
        return deposits[_gameId][by];
    }

    function getPlayers(string calldata _gameId)
        external
        view
        returns (address[] memory)
    {
        return players[_gameId];
    }
}
