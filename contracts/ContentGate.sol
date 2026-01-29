// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Membership.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContentGate is Ownable {
    Membership public membershipContract;

    // Contenuti predefiniti
    string[] private contents;

    constructor(address _membershipAddress) {
        membershipContract = Membership(_membershipAddress);
    }

    // Funzione per controllare se un utente può accedere
    function canAccess(address user) public view returns (bool) {
        return membershipContract.balanceOf(user) > 0;
    }

    // Restituisce tutti i contenuti
    function getContents() public view returns (string[] memory) {
        require(canAccess(msg.sender), "Non sei membro.");
        return contents;
    }

    // Restituisce il numero totale di contenuti
    function contentsCount() public view returns (uint) {
        return contents.length;
    }

    // Funzione per ottenere un contenuto specifico (per frontend)
    function getContent(uint index) public view returns (string memory) {
        require(canAccess(msg.sender), "Non sei membro.");
        require(index < contents.length, "Indice non valido.");
        return contents[index];
    }

    // Solo owner può aggiungere contenuti
    function addContent(string memory url) external onlyOwner {
        contents.push(url);
    }
}
