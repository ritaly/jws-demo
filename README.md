# JWS Demo

**JWT authentication with asymmetric keys**
This repository demonstrates handling JSON Web Signatures (JWS) in Node.js using RSA keys. It includes examples for generating JWS with private keys and verifying them with public keys, handling key IDs (kid) for key selection, and error handling for expired or invalid tokens. 

### Create private and public key

Run:

- private: `openssl genpkey -algorithm RSA -out src/sender/private-key.pem`
- public: `openssl rsa -pubout -in src/sender/private-key.pem -out src/receiver/public-key.pem`

To run program: `npm run test`
