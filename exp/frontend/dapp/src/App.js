import {useEffect, useState} from "react";
import "./App.css";
import {ethers} from "ethers";
import Deathmatch from "./solidity/artifacts/contracts/Deathmatch.sol/Deathmatch.json";
import {OnboardingButton} from "./Components/OnboardingButton";
import {AddAvalancheButton} from "./Components/AddAvalancheButton";

const ContractAddress = "0x9A93C1FFA030e158b58D42f1477f561E96752dc9";

const {v4: uuidv4} = require("uuid");

function addDays(duration) {
	return duration * 86400000 + Date.now();
}

function App() {
	const [error, setError] = useState();
	const [floorPrice, setFloorPrice] = useState(1);
	const [slots, setSlots] = useState(1);
	const [matchId] = useState(uuidv4());
	const [randomSeed] = useState(uuidv4().substring(0, 6));
	const [duration, setDuration] = useState(1);

	// console.log(addDays(1));

	let provider;

	useEffect(() => {
		provider = new ethers.providers.Web3Provider(window.ethereum);
	}, []);

	function noEth() {
		return typeof window.ethereum === "undefined";
	}

	async function requestAccount() {
		try {
			await window.ethereum.request({method: "eth_requestAccounts"});
		} catch (e) {
			console.log(e);
			setError(e.message);
		}
	}

	async function startMatch() {
		if (noEth()) return;
		await requestAccount();
		try {
			const signer = provider.getSigner();
			const contract = new ethers.Contract(ContractAddress, Deathmatch.abi, signer);
			contract.on("MatchStarted", (id, ts) => {
				console.log("MatchStarted triggered", id, ts);
			});
			const tx = await contract.startMatch(matchId, parseInt(floorPrice), parseInt(slots), addDays(parseInt(duration)), randomSeed);
			await tx.wait();
		} catch (e) {
			console.log(e);
			setError(e.message);
		}
	}

	return (
		<div>
			<div>
				<AddAvalancheButton provider={window.ethereum} />
			</div>
			<div>
				<OnboardingButton />
			</div>
			<div>
				<button onClick={requestAccount}>Request Account</button>
				<label>{error}</label>
			</div>
			<div>
				<h3>Start Match</h3>
				<label>Match ID: {matchId}</label>
				<div>
					<label>Floor price (Set the floor price in AVAX. This is the price of entry a player pays times the number of slots they purchase.)</label>
					<select onChange={setFloorPrice}>
						<option>1</option>
						<option>2</option>
						<option>3</option>
						<option>4</option>
						<option>5</option>
					</select>
				</div>
				<div>
					<label>Slots (Set the maximum number of slots per player per match. It increases a players chance to win. Its like buying more than 1 ticket to a lottery)</label>
					<select onChange={setSlots}>
						<option>1</option>
						<option>2</option>
						<option>3</option>
						<option>4</option>
						<option>5</option>
					</select>
				</div>
				<div>
					<label>Random seed: {randomSeed}</label>
				</div>
				<div>
					<label>Duration (in number of days)</label>
					<select onChange={setDuration}>
						<option>1</option>
						<option>2</option>
						<option>3</option>
					</select>
				</div>
				<div>
					<button onClick={startMatch}>Start Match</button>
				</div>
			</div>
			<div></div>
		</div>
	);
}

export default App;
