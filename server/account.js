const secp = require("noble-secp256k1");

class Account {
  constructor(initial_balance) {
    this.balance = initial_balance;
    const private_key = Buffer.from(secp.utils.randomPrivateKey()).toString(
      "hex"
    );
    const public_key = secp.getPublicKey(private_key);
    this.private_key = private_key;
    this.public_key = public_key;
    this.account = public_key.substring(
      0,
      Math.min(80, public_key.length - 40)
    );
  }
}

module.exports = Account;
