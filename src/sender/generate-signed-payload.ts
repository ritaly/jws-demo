import * as crypto from "node:crypto";
import * as fs from "node:fs";

const privateKey = fs.readFileSync(__dirname + "/private-key.pem", "utf-8");

export function generateSignedPayload(payload: Record<string, any>): string {
  const header = {
    alg: "RS256",
    typ: "JWS",
    kid: "testKeyId"
  };
  const iat = +(Date.now() / 1000).toFixed();
  const exp = iat + (5 * 60).toFixed(); // 5 minutes

  const headerBase64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadBase64 = Buffer.from(JSON.stringify({ ...payload, iat, exp })).toString("base64url");
  const data = `${headerBase64}.${payloadBase64}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data);
  const signature = signer.sign(privateKey, "base64url");

  return `${data}.${signature}`;
}
