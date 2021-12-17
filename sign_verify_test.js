const secp = require("noble-secp256k1");
const SHA256 = require("crypto-js/sha256");

(async () => {
  const priv_1 = Buffer.from(secp.utils.randomPrivateKey()).toString("hex");
  const pub_1 = secp.getPublicKey(priv_1);

  const priv_2 = Buffer.from(secp.utils.randomPrivateKey()).toString("hex");
  const pub_2 = secp.getPublicKey(priv_2);

  const msg = "Hello World";
  const hash = SHA256(msg).toString();
  const signatureArr = await secp.sign(hash, priv_1, { recovered: true });
  const signature = signatureArr[0];
  const recovery_bit = signatureArr[1];

  console.log(signature);

  const recovered_key = secp.recoverPublicKey(hash, signature, recovery_bit);
  console.log(pub_1);
  console.log(recovered_key);
  const isValid = secp.verify(signature, hash, pub_1);

  console.log(isValid);
})();

const random_priv_key = Buffer.from(secp.utils.randomPrivateKey()).toString(
  "hex"
);
const random_pub_key = secp.getPublicKey(random_priv_key);

(async () => {
  const private_key = Buffer.from(secp.utils.randomPrivateKey()).toString(
    "hex"
  );
  const public_key = secp.getPublicKey(private_key);

  const hash = SHA256("Hello World").toString(); //does it matter which hashing algorithm is used
  const signatureArray = await secp.sign(hash, private_key, {
    recovered: true,
  });
  const recovery = signatureArray[1];
  const signature = signatureArray[0];

  console.log(
    `Is the signature verified? ${secp.verify(signature, hash, random_pub_key)}`
  );
})();
