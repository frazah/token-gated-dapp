# DApp Token-Gated Content

Questa applicazione decentralizzata (DApp) permette di accedere a **contenuti riservati** solo ai possessori di un NFT. L’obiettivo è dimostrare come l’accesso digitale possa essere controllato direttamente tramite blockchain, senza server centralizzati.

---

## Architettura della DApp

La DApp utilizza **due smart contract separati** per distinguere la gestione della membership dalla logica dei contenuti:

### 1. `Membership.sol` (NFT di Accesso)

* Contratto ERC721 standard basato su OpenZeppelin.
* Ogni NFT rappresenta una **membership digitale** per accedere ai contenuti.
* Solo l’amministratore può creare (`mint`) nuovi NFT e assegnarli agli utenti.

### 2. `ContentGate.sol` (Contenuti Premium)

* Contiene l’elenco dei contenuti token-gated.
* Verifica, **on-chain**, che l’indirizzo connesso possieda almeno un NFT.
* Gli utenti senza NFT non possono visualizzare i contenuti.

> Questa separazione garantisce un controllo reale on-chain: i contenuti non sono accessibili se non si possiede un NFT valido.

---

## Stack Tecnologico

*   **Smart Contract:** Solidity (con OpenZeppelin per standard ERC721 e Ownable)
*   **Ambiente di Sviluppo Ethereum:** Hardhat
*   **Blockchain Locale:** Ganache (per un ambiente di sviluppo stabile)
*   **Libreria di Interazione (Frontend):** Ethers.js
*   **Frontend:** HTML, CSS, JavaScript
*   **Wallet:** MetaMask

---

## Istruzioni per l'Esecuzione Locale

Questa guida garantisce un avvio pulito e funzionante del progetto.

### Prerequisiti

1.  **Node.js:** Assicurati di avere installato Node.js (versione 16 o successiva).
2.  **Ganache:** Installa Ganache a livello globale. Se non lo hai già fatto, esegui:
    ```bash
    npm install -g ganache
    ```
3.  **MetaMask:** Installa l'estensione per browser MetaMask.

### Step 1: Installazione delle Dipendenze

Apri un terminale nella cartella principale del progetto ed esegui:
```bash
npm install
```

### Step 2: Avvio della Blockchain Locale (Ganache)

Nel **primo terminale** avvia la blockchain Ganache con il nostro script personalizzato.
```bash
npm run start-chain
```
Vedrai una lista di account di test con le loro chiavi private. **Lascia questo terminale aperto.**

### Step 3: Deploy degli Smart Contract

Apri un **secondo terminale** ed esegui lo script di deploy:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Questo comando:
1.  Compilerà i contratti.
2.  Pubblicherà `Membership.sol` e `ContentGate.sol` sulla tua blockchain Ganache.
3.  **Assegnerà automaticamente un NFT di prova** ai primi account di test.
4.  Creerà/aggiornerà il file `frontend/contractInfo.js` con le informazioni necessarie al frontend.

### Step 4: Configurazione di MetaMask

1.  **Aggiungi la Rete Ganache a MetaMask:**
    *   `Impostazioni > Reti > Aggiungi rete > Aggiungi una rete manualmente`
    *   **Nome rete:** `Ganache Locale`
    *   **Nuovo URL RPC:** `http://127.0.0.1:8545`
    *   **ID catena:** `1337`
    *   **Simbolo valuta:** `ETH`

2.  **Importa gli Account di Test:**
    *   Nel terminale di Ganache, copia la **chiave privata** del primo account (`(0)`). In MetaMask, importa l'account. Questo sarà l'**Amministratore**.
    *   Fai lo stesso per il secondo e il terzo account (`(1) e (2)`). Questi saranno un **Membro** che possiede già un NFT e un **Non Membro**.

### Step 5: Avvio del Frontend

In un **terzo terminale**:
```bash
# Questo comando serve la cartella 'frontend' sulla porta 8000
python3 -m http.server 8000 --directory frontend
```


### Step 6: Come Usare la DApp

1. **Accesso Amministratore:**
   * Connettiti con l’account amministratore tramite MetaMask.
   * Vedrai il pannello admin, dove puoi aggiungere contenuti premium e mintare NFT.
   * Queste operazioni registrano tutto direttamente sulla blockchain locale.

2. **Accesso Utente con NFT:**
   * Cambia account su MetaMask con un indirizzo che possiede almeno un NFT.
   * Ricarica la pagina: il frontend mostrerà automaticamente i contenuti token-gated.
   * Potrai visualizzare immagini, link o altri contenuti riservati.

3. **Accesso Utente Non Membro:**
   * Connettiti con un account senza NFT.
   * Vedrai lo stato “Non Membro” e i contenuti premium rimarranno nascosti.
   * Questo dimostra il vero controllo on-chain: solo chi possiede l’NFT può accedere.

> Nota: ricaricando la pagina o cambiando account, il frontend verifica sempre on-chain il possesso dell’NFT prima di mostrare i contenuti.
