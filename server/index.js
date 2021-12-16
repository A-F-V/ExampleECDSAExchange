const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const Account = require("./account");
const ec = require("elliptic").ec;
const ecdsa = new ec("secp256k1");
let sha3 = require("js-sha3");
const SHA256 = require("crypto-js/sha256");
const secp = require("noble-secp256k1");

// localhost can have cross origin errors
// depending on the browser you use!

const accounts = [new Account(100), new Account(75), new Account(50)];

function display_accounts() {
  console.log("Available Accounts\n==================");
  accounts.forEach((acc, i) => {
    console.log(`(${i}): ${acc.account}  (${acc.balance} AFV-COIN)`);
  });

  console.log("\nPrivate Keys (Shhh)\n==================");
  accounts.forEach((acc, i) => {
    console.log(`(${i}): ${acc.private_key}`);
  });
}

function get_account(address) {
  return accounts.find((acc) => acc.account === address);
}

function send_money(sender_account, amount, recipient_account) {
  sender_account.balance -= amount;
  recipient_account.balance += amount;
}

function verify_request(msg, signature, recovery) {
  const hash = SHA256(JSON.stringify(msg)).toString();

  const public_key = secp.recoverPublicKey(hash, signature, recovery);

  console.log(public_key);
  console.log(signature);
  console.log(secp.verify(signature, hash, public_key));
  return secp.verify(signature, hash, public_key);
}

display_accounts(accounts);

app.use(cors());
app.use(express.json());

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = get_account(address)?.balance || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { msg, signature, recovery } = req.body;
  const { sender, amount, recipient } = msg;

  const sender_account = get_account(sender);
  const recipient_account = get_account(recipient);
  const amt = parseInt(amount);
  if (
    sender_account &&
    recipient_account &&
    sender_account.balance >= amt &&
    verify_request(msg, signature, recovery)
  ) {
    send_money(sender_account, amt, recipient_account);
  }
  res.send({ balance: sender_account?.balance || 0 });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
