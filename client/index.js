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
const random_priv_key = Buffer.from(secp.utils.randomPrivateKey()).toString(
  "hex"
);
const random_pub_key = secp.getPublicKey(random_priv_key);

document.getElementById("transfer-amount").addEventListener(
  "click",
  async () => {
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

    const recovered_key = secp.recoverPublicKey(hash, signature, recovery);
    console.log(recovered_key);
    console.log(secp.verify(signature, hash, recovered_key));
    console.log({ signature, hash, recovered_key });

    const body = JSON.stringify({ msg, signature, recovery });

    const request = new Request(`${server}/send`, { method: "POST", body });

    fetch(request, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        return response.json();
      })
      .then(({ balance }) => {
        document.getElementById("balance").innerHTML = balance;
      });
  },
  false
);
