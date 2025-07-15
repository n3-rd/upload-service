import { GenericAesCtrStreamingCrypto } from './symmetric/generic-aes-ctr-streaming-crypto.js'
import { NodeAesCbcCrypto } from './symmetric/node-aes-cbc-crypto.js'
import { LitCryptoAdapter } from './adapters/lit-crypto-adapter.js'
import { KMSCryptoAdapter } from './adapters/kms-crypto-adapter.js'

/**
 * Create a KMS crypto adapter for Node.js using the generic AES-CTR streaming crypto.
 * Works in Node.js & browser environments.
 *
 * @param {URL|string} keyManagerServiceURL
 * @param {string} keyManagerServiceDID
 */
export function createGenericKMSAdapter(
  keyManagerServiceURL,
  keyManagerServiceDID
) {
  const symmetricCrypto = new GenericAesCtrStreamingCrypto()
  return new KMSCryptoAdapter(
    symmetricCrypto,
    keyManagerServiceURL,
    /** @type {`did:${string}:${string}`} */ (keyManagerServiceDID)
  )
}

/**
 * Create a Lit crypto adapter for Node.js using AES-CBC (legacy).
 * Compatible with previous versions of the library.
 *
 * @deprecated Use createGenericLitAdapter instead for new uploads.
 * @param {import('@lit-protocol/lit-node-client').LitNodeClient} litClient
 */
export function createNodeLitAdapter(litClient) {
  const symmetricCrypto = new NodeAesCbcCrypto()
  return new LitCryptoAdapter(symmetricCrypto, litClient)
}

/**
 * Create a Lit crypto adapter for Node.js using the generic AES-CTR streaming crypto.
 * Works in Node.js & browser environments.
 *
 * @param {import('@lit-protocol/lit-node-client').LitNodeClient} litClient
 */
export function createGenericLitAdapter(litClient) {
  const symmetricCrypto = new GenericAesCtrStreamingCrypto()
  return new LitCryptoAdapter(symmetricCrypto, litClient)
}
