import { get_appID } from "./main.js";

//Følgende er en framtidig tenkt funksjon jeg har lyst til å lage.
localStorage.setItem("lastSearch", "");
const searchVal = document.getElementById("search");
const searchForm = document.getElementById("search-form");
const results = document.getElementById("results");

//Følgende funksjoner henter data fra api-en til Wargaming og leverer det som "data", i json format.
const getPlayerList_text = async (appId, text_search) => { 
	try {
		if (appId === null) {
			return false;
		} else {
			const response = await fetch(`https://api.worldofwarships.eu/wows/account/list/?application_id=${appId}&search=${text_search}&limit=32`);
			const data = await response.json();
			return data;
		}
	} catch (error) {
		console.error(error);
		return null;
	}
};
const get_playerData_ID = async (appId, brukerId) => {
	try {
		if (appId === null) {
			return false;
		} else {
			const response = await fetch(`https://api.worldofwarships.eu/wows/account/info/?application_id=${appId}&account_id=${brukerId}`);
			const data = await response.json();
			return data;
		}
	} catch (error) {
		console.error(error);
		return null;
	}
};
const get_shipData_ID = async (appId, shipId) => {
	try {
		if (appId === null) {
			return false;
		} else {
			const response = await fetch(`https://api.worldofwarships.eu/wows/encyclopedia/ships/?application_id=${appId}&ship_id=${shipId}`);
			const data = await response.json();
			return data;
		}
	} catch (error) {
		console.error(error);
		return null;
	}
};
const get_playerShipData_ID = async (appId, brukerId, shipId) => {
	try {
		if (appId === null) {
			return false;
		} else {
			const response = await fetch(`https://api.worldofwarships.eu/wows/ships/stats/?application_id=${appId}&account_id=${brukerId}&ship_id=${shipId}`);
			const data = await response.json();
			return data;
		}
	} catch (error) {
		console.error(error);
		return null;
	}
};

//Siden vi får tilbake tallverider til "skip-nivået", men alle spillere er vant med det som romertall og en stjerne, gjør jeg denne utregningen
const tierTilInGameSymbol = (tall) => {
    try {
        if (tall < 1 || tall > 11) { //Bare for tall mellom 1 og 11, det er i teorien bare de som er mulig, og om noe skjer feil, error.
            throw new Error("Bare tall mellom 1 og 11");
        }
        const romerskeTall = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', '★']; //her er det reell latskap, en liste på 12 elementer, for å sjekke verdier mellom 1 og 11.
        return romerskeTall[tall];
    } catch (error) {
        return error.message;
    }
};

//Dette er hovedfunksjonen som viser dataen vi får fra api-en, og viser det på en fin måte. Samt at den kan nokså lett endres slik den viser det slik jeg vil.
const visData = async (appID_, data, typeSearch, locId = 0) => { 
	results.innerHTML = "";
	try {
		switch (typeSearch) {
			case "playerID":
				try {
					//Denne funksjonen VIL endres, til noe annet, men har foreløpig ikke funnet ut hvordan jeg vil ha det, kopierer så slik det ville vært for en spiller liste.
					results.innerHTML = `<div id="boxes"></div>`;
					const boxes = document.getElementById("boxes");
					//Hente inn informasjonen fra de forskjellige api-sidene, som jeg har tenkt å bruke nå.
					let maxFragShipId = data.data[locId].statistics.pvp.max_xp_ship_id;
					let shipData = await get_shipData_ID(appID_, maxFragShipId);
					let playersShipData = await get_playerShipData_ID(appID_, locId, maxFragShipId);
					if (maxFragShipId === null || shipData.data[maxFragShipId] === null) {
						maxFragShipId = null;
						shipData.status = "error";
					}
					//Dette er en "template" for hvordan jeg vil at alt skal sorteres, dette er så kopier i style.css, slik at jeg får alt der jeg vil ha det.
					let boxContent = `<div id="listResult"> 
										<div id="playerCard">
											<h1 id="playerName">${data.data[locId].nickname}</h1>
											<p id="playerID"><a href="#?pID=${locId}&search=${data.data[locId].nickname}">${locId}</a></p>
										</div>
										<div id="bestShip">
											<h2 id="shipName"><a href="#?sID=${maxFragShipId}&search=${maxFragShipId === null ? null : shipData.data[maxFragShipId].name}">${maxFragShipId === null ? "Not played pvp" : shipData.data[maxFragShipId].name}</a></h2>
											<p id="shipTier">${shipData.status === "error" ? "" : tierTilInGameSymbol(shipData.data[maxFragShipId].tier)}</p>
											<p id="shipKills">${shipData.status === "error" ? "" : playersShipData.data[locId][0].pvp.frags + " frags"}</p>
											<p id="shipExp">${shipData.status === "error" ? "" : playersShipData.data[locId][0].pvp.xp + " XP"}</p>
											<p id="shipWinPercent">${shipData.status === "error" ? "" : Math.round((playersShipData.data[currID][0].pvp.wins / playersShipData.data[currID][0].pvp.battles) * 100) + "% wins"}</p>
											<img src="${shipData.status === "error" ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" : shipData.data[maxFragShipId].images.small}" width="50%" alt="${shipData.description}">
										</div>
										<div id="additionalInfo">
											<h3>Additional Info</h3>
											<p id="accountLevel">Level ${data.data[locId].leveling_tier}</p>
											<p id="joinedAt">User since ${new Date(data.data[locId].created_at * 1000).toLocaleDateString()}</p>
											<p id="karma">Karma is ${data.data[locId].karma === null ? "Best" : "Not Best"}</p>
										</div>
										<div id="pvpStats">
											<h3>PvP Stats</h3>
											<p id="totalBattles">${data.data[locId].statistics.pvp.battles} battles</p>
											<p id="wins"> ${data.data[locId].statistics.pvp.wins} wins</p>
											<p id="winRate">${data.data[locId].statistics.pvp.battles === 0 ? "0" : Math.round((data.data[locId].statistics.pvp.wins / data.data[locId].statistics.pvp.battles) * 100)}% wins</p>
											<p id="survivedBattles">${data.data[locId].statistics.pvp.survived_battles} battles survived</p>
										</div>
									</div>`;
					boxes.innerHTML += boxContent;
					break;
				} catch (error) {
					console.error(error);
					return 0;
				}
			case "shipID": //Hadde tenkt å gjøre det mulig å søke etter skip, etter id, men hadde ikke tid til å lage det.
				results.innerHTML = `<p> Denne funksjonen er forløpig ikke klar...</p>`;
				break;
			case "playerList": //her repiterer jeg det samme som i "playerID", eneste forskjellen er at det lages en ny boks for hver spiller jeg får retunert, noe jeg spesifiserer i api-kallet.
				try {
					results.innerHTML += `<div id="boxes"></div>`;
					const boxes = document.getElementById("boxes");
					for (let i = 0; i < data.meta.count; i++) { //jeg kan sjekke nøyaktig hvor mange spillere jeg har fått, og slepper da å kjøre løkken unødig.
						let currID = data.data[i].account_id;
						let i_data = await get_playerData_ID(appID_, currID);
						if (i_data.data[currID].hidden_profile === true) {
							continue;
						}
						
						let maxFragShipId = i_data.data[currID].statistics.pvp.max_xp_ship_id;
						let shipData = await get_shipData_ID(appID_, maxFragShipId);
						let playersShipData = await get_playerShipData_ID(appID_, currID, maxFragShipId);
						if (maxFragShipId === null || shipData.data[maxFragShipId] === null) {
							maxFragShipId = null;
							shipData.status = "error";
						}
						//Under er det mye jeg ikke kan helt kommentere, for alt er i en streng, så om det er spørsmål, så spør!
						let boxContent = `<div id="listResult">
											<div id="playerCard">
												<h1 id="playerName">${data.data[i].nickname}</h1>
												<p id="playerID"><a href="#?pID=${currID}&search=${data.data[i].nickname}">${currID}</a></p>
											</div>
											<div id="bestShip">
												<h2 id="shipName"><a href="#?sID=${maxFragShipId}&search=${maxFragShipId === null ? null : shipData.data[maxFragShipId].name}">${maxFragShipId === null ? "Not played" : shipData.data[maxFragShipId].name}</a></h2>
												<p id="shipTier">${shipData.status === "error" ? "" : tierTilInGameSymbol(shipData.data[maxFragShipId].tier)}</p>
												<p id="shipKills">${shipData.status === "error" ? "" : playersShipData.data[currID][0].pvp.frags + " frags"}</p>
												<p id="shipExp">${shipData.status === "error" ? "" : playersShipData.data[currID][0].pvp.xp + " XP"}</p>
												<p id="shipWinPercent">${shipData.status === "error" ? "" : Math.round((playersShipData.data[currID][0].pvp.wins / playersShipData.data[currID][0].pvp.battles) * 100) + "% wins"}</p>
												<img src="${shipData.status === "error" ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" : shipData.data[maxFragShipId].images.small}" width="50%" alt="${shipData.description}">
											</div>
											<div id="additionalInfo">
												<h3>Additional Info</h3>
												<p id="accountLevel">Level ${i_data.data[currID].leveling_tier}</p>
												<p id="joinedAt">User since ${new Date(i_data.data[currID].created_at * 1000).toLocaleDateString()}</p>
												<p id="karma">Karma is ${i_data.data[currID].karma === null ? "Best" : "Not Best"}</p>
											</div>
											<div id="pvpStats">
												<h3>PvP Stats</h3>
												<p id="totalBattles">${i_data.data[currID].statistics.pvp.battles} battles</p>
												<p id="wins"> ${i_data.data[currID].statistics.pvp.wins} wins</p>
												<p id="winRate">${i_data.data[currID].statistics.pvp.battles === 0 ? "0" : Math.round((i_data.data[currID].statistics.pvp.wins / i_data.data[currID].statistics.pvp.battles) * 100)}% wins</p>
												<p id="survivedBattles">${i_data.data[currID].statistics.pvp.survived_battles} battles survived</p>
											</div>
                            			</div>`;
						boxes.innerHTML += boxContent;
					}
					break;
				} catch (error) {
					console.error(error);
					return 0;
				}
			default:
				results.innerHTML = "<p>Feil ved henting av spillerdata.</p>"; //Om det skulle skje en feil, så vil brukeren få beskjed om det.
				console.log(data);
				break;
		}
	} catch (error) {
		console.error(error);
		return 0; 
	}
};
//Om denne får en error

searchForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	try {
		const appID = get_appID();

		switch (appID) { //Her sjekker jeg om appID-en er gyldig, og om ikke, så får brukeren beskjed om det.
			case null:
				results.innerHTML = "<p>Feil ved henting av applikasjons-ID.</p>";
				return;
		}
		
		// localStorage.setItem("lastSearch", searchVal.value);
		// disse neste linjene gjør at man ikke lagrer to søk oppåhverandre, det hadde laget kaos.
		let data = null;
		let typeOfSearch = null;
		let localID = undefined;
		//Sjekker om det er en spillerID, skipID eller en tekst, og henter dataen deretter, det er spesifikke kriterier for hvert søk, så jeg kan begrense hvor mye jeg bruker API-en selv.
		if (searchVal.value[0] === "5" && searchVal.value.length == 9) {
			data = await get_playerData_ID(appID, searchVal.value);
			typeOfSearch = "playerID";
		} else if (searchVal.value[0] === "4" && searchVal.value.length == 10) {
			data = await get_shipData_ID(appID, searchVal.value);
			typeOfSearch = "shipID";
		} else {
			data = await getPlayerList_text(appID, searchVal.value);
			if (data.meta.count === 0) {
				results.innerHTML = "<p>Ingen spillere funnet.</p>";
				return;
			} else if (data.meta.count === 1) { //Om det er kun en spiller, så henter jeg dataen for den spilleren, og setter typeOfSearch til "playerID", istedenfor å kjøre unødig mye kode.
				localID = data.data[0].account_id;
				data = await get_playerData_ID(appID, data.data[0].account_id);
				typeOfSearch = "playerID";
			} else {
				typeOfSearch = "playerList";
			}
		}

		switch (data) { //Siden jeg vet hvilke feil som kan komme (og uansett sjekker for uventete også), så kan jeg håndtere dette med informasjon tilbake til brukeren, slik den vet hva den må gjøre for å benytte søkemotoren.
			case false:
				results.innerHTML = "<p>Feil ved henting av applikasjons-ID.</p>";
				break;
			case null:
				results.innerHTML = "<p>Feil ved henting av spillerdata.</p>";
				break;
			default:
				if (data.error !== undefined) {
					console.log(data);
					switch (data.error.message) {
						case "NOT_ENOUGH_SEARCH_LENGTH":
							results.innerHTML = "<p>Skriv inn minst 3 tegn.</p>";
							break;
						case "INVALID_SEARCH":
							results.innerHTML = "<p>Det du skrev ble ikke godkjent, vennligst pass på at det du skriver er ett gokjent brukernavn.</p>";
							break;
						case "SEARCH_NOT_SPECIFIED":
							results.innerHTML = "<p>Skriv inn minst 3 tegn.</p>";
							break;
						default:
							results.innerHTML = "<p>Feil ved henting av spillerdata.</p>";
							console.log(data);
							break;
					}
				} else {
					if (localID !== undefined) { //Her er en liten sjekk for lokalt lagret verdier, for det kan hende en er lagret, denne er nå ikke i bruk, men vil bli brukt når jeg skal lagre søket til spilleren.
						visData(appID, data, typeOfSearch, localID);
					} else {
						visData(appID, data, typeOfSearch, searchVal.value);
						break;
					}
				}
		}
	} catch (error) {
		console.error(error);
		return;
	}
});

document.addEventListener("DOMContentLoaded", () => { //Her fyller jeg inn automatisk søk, om det er lagret fra før. Skal foreløpig ikke være i bruk.
	let lastSearch = localStorage.getItem("lastSearch");
	if (lastSearch !== "") {
		searchVal.value = lastSearch;
	} else {
		searchVal.value = "";
	}
});