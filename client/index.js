import { assert } from "elliptic/lib/elliptic/utils";
const secp = require("noble-secp256k1");
import "./index.scss";
const ec = require("elliptic").ec;
const ecdsa = new ec("secp256k1");
let sha3 = require("js-sha3");
const SHA256 = require("crypto-js/sha256");

const server = "http://localhost:3042";

document
  .getElementById("exchange-address")
  .addEventListener("input", ({ target: { value } }) => {
    if (value === "") {
      document.getElementById("balance").innerHTML = 0;
      return;
    }

    fetch(`${server}/balance/${value}`)
      .then((response) => {
        return response.json();
      })
      .then(({ balance }) => {
        document.getElementById("balance").innerHTML = balance;
      });
  });

document
  .getElementById("transfer-amount")
  .addEventListener("click", async () => {
    const sender = document.getElementById("exchange-address").value;
    const amount = document.getElementById("send-amount").value;
    const recipient = document.getElementById("recipient").value;
    const msg = { sender, amount, recipient };

    const private_key = document.getElementById("private-key").value;
    //const hash = sha3.keccak256(JSON.stringify(msg)).toString();
    const hash = SHA256(JSON.stringify(msg)).toString(); //does it matter which hashing algorithm is used
    const signatureArray = await secp.sign(hash, private_key, {
      recovered: true,
    });
    const recovery = signatureArray[1];
    const signature = signatureArray[0];

    const body = JSON.stringify({ msg, signature, recovery });

    const request = new Request(`${server}/send`, { method: "POST", body });

    fetch(request, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        return response.json();
      })
      .then(({ balance }) => {
        document.getElementById("balance").innerHTML = balance;
      });
  });
