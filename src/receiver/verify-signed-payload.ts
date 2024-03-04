import * as fs from "node:fs";
import { decode, JwtPayload, JsonWebTokenError, TokenExpiredError, verify } from 'jsonwebtoken';


export function verifySignedPayload(signedPayload: string): JwtPayload | string {
  try {
    const kid = extractKidFromToken(signedPayload)

    const publicKey = getPublicKeyByKid(kid);

    const decoded = verify(signedPayload, publicKey, { algorithms: ["RS256"] });
    return decoded as JwtPayload;
  
  } catch (error) {
    // error handling & logging
    switch (true) {
      case error instanceof TokenExpiredError:
          return "Token has expired.";
      case error instanceof JsonWebTokenError:
          return "Invalid token.";
      default:
          return "An error occurred while verifying the token.";
    }
  }
}

function getPublicKeyByKid(kid: string): string {
  // placeholder: fetch the appropriate public key based on the kid
  if ( kid == 'testKid!') {
    throw new Error("No public key for this kid");
  }
  const publicKey = fs.readFileSync(__dirname + "/public-key.pem", "utf-8");
  return publicKey;
}


function extractKidFromToken(signedPayload: string): string {
  const decodedHeader = decode(signedPayload, { complete: true });
  if (!decodedHeader || typeof decodedHeader !== 'object') {
    throw new Error("Invalid token structure.");
  }
  
  const kid = decodedHeader.header.kid;
  if (typeof kid !== 'string') {
    throw new Error("Token missing 'kid' in header.");
  }

  return kid;
}

