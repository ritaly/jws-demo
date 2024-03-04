import { verifySignedPayload } from "./receiver/verify-signed-payload";
import { generateSignedPayload } from "./sender/generate-signed-payload";
import * as fs from "node:fs";
import { JwtHeader, sign, SignOptions } from 'jsonwebtoken';

interface Payload {
  userId: string;
  licences: string[];
}

describe("JWT handling", () => {
  describe("when happy scenario", () => {
    const payload: Payload = {
      userId: "abc",
      licences: ["a", "b", "c"],
    };

    afterAll(() => {
      console.log("❗ TRY TO PASTE SIGNED PAYLOADS ABOVE TO ->  https://jwt.io/ ❗");
    });
    it("verifies valid token", () => {
      const signedPayload = generateSignedPayload(payload);
      console.log("Try pasting it to: https://jwt.io/");
      console.log(signedPayload);

      const body = { signedPayload };
      console.log('request body as expected: ', body);

      const verified = verifySignedPayload(signedPayload);
      console.log(`Signature is ${verified ? "verified" : "not verified"}`);
    });

    it("verifies a JWT with the correct `kid`", () => {
      const signedPayload = generateSignedPayload(payload);
      const verificationResult = verifySignedPayload(signedPayload);

      if (typeof verificationResult !== 'string') { 
        expect(verificationResult.userId).toBe(payload.userId);
        expect(verificationResult.licences).toEqual(expect.arrayContaining(payload.licences));
      }
    });
  });

  describe("when unhappy scenario", () => {
    const payload: Payload = {
      userId: "abc",
      licences: ["a", "b", "c"],
    };

    it("handles the scenario where `kid` is missing", () => {
      const signedPayloadWithoutKid = generateToken(payload, { noTimestamp: true });
      const verificationResult = verifySignedPayload(signedPayloadWithoutKid);
      expect(verificationResult).toEqual("An error occurred while verifying the token.");
    });

    it("rejects an expired token", () => {
      const kid = "testKeyId";
      const expiredToken = generateToken(payload, { expiresIn: "-1h" }, kid); // expired 1 hour ago
      const verificationResult = verifySignedPayload(expiredToken);
      expect(verificationResult).toBe("Token has expired.");
    });
  });
});

function generateToken(payload: Payload, options: SignOptions = {}, kid?: string): string {
  const privateKey = fs.readFileSync(__dirname + "/sender/private-key.pem", "utf-8");
  
  let header: JwtHeader = { alg: "RS256", typ: "JWT" };

  if (kid) {
    header = { ...header, kid };
  }

  if (options.header) {
    header = { ...header, ...options.header };
  }

  const signOptions: SignOptions = {
    ...options,
    algorithm: "RS256",
    header
  };

  return sign(payload, privateKey, signOptions);
}
