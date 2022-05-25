//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "./OwnableExt.sol";

contract Matchbase is OwnableExt {
	enum MatchStatus {
		NotStarted,
		Started,
		Finished
	}

	struct ClaimPercent {
		uint winner;
		uint protocol;
		uint partner;
	}

	struct MatchInfo {
		MatchStatus matchStatus;
		uint timeStarted;
		uint duration;
		uint floorPrice;
		uint maxSlotsPerWallet;
		address partner;
	}

	struct DepositInfo {
		uint depositAmount;
		uint slots;
		bool deposited;
	}

	mapping(string => MatchInfo) internal matches; // metadata about matches
	mapping(string => mapping(address => DepositInfo)) internal deposits; // metadata about deposits
	mapping(string => address[]) internal players; // slots per game
	mapping(string => mapping(address => uint)) internal wallets; // unique wallets per game
	mapping(string => uint) internal prizePools; // all the avax deposited per game
	mapping(string => mapping(address => uint)) internal winnings; // claimed by winners
	mapping(string => mapping(address => uint)) internal rewards; // claimed by partners
	mapping(string => mapping(address => uint)) internal claims; // all claims

	address payable internal externalWallet;
	address internal vrfContractAddress;
	ClaimPercent internal defaultClaimPct = ClaimPercent(80, 15, 5); // total of all three must be 100

	event MatchStarted(string, uint);
	event WalletChanged(address, address);
	event FeeDeposited(string, address, uint);
	event WinnerPicked(string, address, uint, uint);
	event PrizeClaimed(string, address, uint);
	event RewardClaimed(string, address, uint);

	constructor(address payable _wallet, address _vrfContractAddress) OwnableExt() {
		require(_wallet != address(0), "invalid address");
		externalWallet = _wallet;
		vrfContractAddress = _vrfContractAddress;
	}

	/**
        modifiers
     */

	// modifier seedLength(string calldata seed) {
	// 	uint length = bytes(seed).length;
	// 	require(length > 5 && length < 10, "seed length");
	// 	_;
	// }

	modifier ownerOrPartner(string calldata _gameId) {
		require(
			super.isOwner(msg.sender) || matches[_gameId].partner == msg.sender,
			"only owner or starter"
		);
		_;
	}

	/**
        property getters/setters
    */

	function setWallet(address payable _wallet) external onlyOwner {
		require(_wallet != address(0), "invalid address");
		address oldWallet = externalWallet;
		externalWallet = _wallet;
		emit WalletChanged(externalWallet, oldWallet);
	}

	function setVrfAddress(address contractAddress) external onlyOwner {
		vrfContractAddress = contractAddress;
	}

	function getMatchStatus(string calldata _gameId) external view returns (MatchStatus) {
		return matches[_gameId].matchStatus;
	}

	function getFloorPrice(string calldata _gameId) external view returns (uint) {
		return matches[_gameId].floorPrice;
	}

	function getDepositInfo(string calldata _gameId, address by)
		external
		view
		returns (DepositInfo memory)
	{
		return deposits[_gameId][by];
	}

	function getPlayers(string calldata _gameId) external view returns (address[] memory) {
		return players[_gameId];
	}

	function getPrizePool(string calldata _gameId) public view returns (uint) {
		return prizePools[_gameId];
	}

	function getPrizeAmount(string calldata _gameId, address _winner) public view returns (uint) {
		return winnings[_gameId][_winner];
	}

	function getRewardAmount(string calldata _gameId, address _partner)
		public
		view
		returns (uint)
	{
		return rewards[_gameId][_partner];
	}

	function getBalance() public view returns (uint) {
		return address(this).balance;
	}

	function verifyClaim(
		string calldata _gameId,
		address _claimer,
		uint amount
	) external view returns (bool) {
		require(claims[_gameId][_claimer] == amount, "failed");
		return true;
	}
}
