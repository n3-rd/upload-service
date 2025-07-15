import { Wallet } from 'ethers'
import { UnknownLink } from 'multiformats'
import { Client as StorachaClient } from '@storacha/client'
import { Result, Failure, Block, Proof } from '@ucanto/interface'
import {
  AccessControlConditions,
  AuthMethod,
  AuthSig,
  SessionSigsMap,
} from '@lit-protocol/types'
import type {
  BlobLike,
  AnyLink,
  Signer,
  DID,
  SigAlg,
} from '@storacha/client/types'

export type { IPLDBlock } from '@ucanto/interface'
export type { SpaceDID } from '@storacha/capabilities/types'
export type { UnknownFormat } from '@storacha/capabilities/types'
export type { Result, UnknownLink }
export type { BlobLike, AnyLink }

// Import SpaceDID for use in interfaces
import type { SpaceDID } from '@storacha/capabilities/types'

export interface EncryptedClient {
  encryptAndUploadFile(file: BlobLike, config: EncryptionConfig): Promise<AnyLink>
  retrieveAndDecryptFile(
    cid: AnyLink,
    delegationCAR: Uint8Array,
    decryptionOptions: DecryptionOptions
  ): Promise<ReadableStream>
}

export type EncryptedClientOptions = {
  storachaClient: StorachaClient
  cryptoAdapter: CryptoAdapter
  gatewayURL?: URL
}

export interface EncryptOutput {
  key: Uint8Array
  iv: Uint8Array
  encryptedStream: ReadableStream
}

export interface SymmetricCrypto {
  encryptStream(data: BlobLike): Promise<EncryptOutput>
  decryptStream(
    encryptedData: ReadableStream,
    key: Uint8Array,
    iv: Uint8Array
  ): Promise<ReadableStream>
  
  // Algorithm-specific key/IV management
  combineKeyAndIV(key: Uint8Array, iv: Uint8Array): Uint8Array
  splitKeyAndIV(combined: Uint8Array): { key: Uint8Array, iv: Uint8Array }
}

export interface CryptoAdapter {
  // Symmetric crypto operations (delegated to composed SymmetricCrypto)
  encryptStream(data: BlobLike): Promise<EncryptOutput>
  decryptStream(
    encryptedData: ReadableStream,
    key: Uint8Array,
    iv: Uint8Array
  ): Promise<ReadableStream>
  
  // Strategy-specific key management
  encryptSymmetricKey(
    key: Uint8Array,
    iv: Uint8Array,
    encryptionConfig: EncryptionConfig
  ): Promise<EncryptedKeyResult>
  decryptSymmetricKey(
    encryptedKey: string,
    configs: {
      decryptionOptions: DecryptionOptions
      metadata: ExtractedMetadata
      delegationCAR: Uint8Array
      resourceCID: AnyLink
      issuer: Signer<DID, SigAlg>
      audience: DID
    }
  ): Promise<{ key: Uint8Array, iv: Uint8Array }>
  extractEncryptedMetadata(car: Uint8Array): ExtractedMetadata
  getEncryptedKey(metadata: ExtractedMetadata): string
  encodeMetadata(
    encryptedDataCID: string,
    encryptedKey: string,
    metadata: LitKeyMetadata | KMSKeyMetadata
  ): Promise<{ cid: AnyLink, bytes: Uint8Array }>
}

// User-provided configuration (required settings)
export interface EncryptionConfig {
  /**
   * The issuer of the encryption request
   */
  issuer: Signer<DID, SigAlg>

  /**
   * The DID of the space to encrypt the file for
   */
  spaceDID: SpaceDID

  /**
   * The location of the KMS key to use for encryption
   */
  location?: string

  /**
   * The keyring of the KMS key to use for encryption
   */
  keyring?: string
}

export interface DecryptionOptions {
  // User-provided options
  // Lit-specific (signer information)
  wallet?: Wallet
  sessionSigs?: SessionSigsMap
  // Lit PKP-specific (signer information)
  pkpPublicKey?: string
  authMethod?: AuthMethod
  // KMS-specific
  spaceDID?: SpaceDID
  delegationProof?: Proof
}

export interface EncryptedKeyResult {
  strategy: EncryptionStrategy
  encryptedKey: string
  metadata: LitKeyMetadata | KMSKeyMetadata
}

export type EncryptionStrategy = 'lit' | 'kms'

export interface LitKeyMetadata {
  plaintextKeyHash: string
  accessControlConditions: AccessControlConditions
}

export interface KMSKeyMetadata {
  space: SpaceDID
  kms: {
    provider: string
    keyId: string
    algorithm: string
    keyReference: string
  }
}

export type EncryptionPayload = {
  strategy: EncryptionStrategy
  encryptedKey: string
  metadata: LitKeyMetadata | KMSKeyMetadata
  encryptedBlobLike: BlobLike
}

export type GenericAccessControlCondition = [Record<string, any>] // eslint-disable-line @typescript-eslint/no-explicit-any

export interface LitMetadataInput {
  encryptedDataCID: string
  identityBoundCiphertext: string
  plaintextKeyHash: string
  accessControlConditions: AccessControlConditions
}

export interface LitMetadata {
  encryptedDataCID: UnknownLink
  identityBoundCiphertext: Uint8Array
  plaintextKeyHash: Uint8Array
  accessControlConditions: AccessControlConditions
}

export interface LitMetadataView extends LitMetadata {
  /** Encode it to a CAR file. */
  archive(): Promise<Result<Uint8Array>>
  archiveBlock(): Promise<Block>
  toJSON(): LitMetadataInput
}

// KMS-specific metadata types
export interface KMSMetadata {
  encryptedDataCID: UnknownLink
  encryptedSymmetricKey: string
  space: SpaceDID
  kms: {
    provider: string
    keyId: string
    algorithm: string
    keyReference?: string
  }
}

export interface KMSMetadataInput {
  encryptedDataCID: string
  encryptedSymmetricKey: string
  space: string
  kms: {
    provider: string
    keyId: string
    algorithm: string
    keyReference?: string
  }
}

export interface KMSMetadataView extends KMSMetadata {
  /** Encode it to a CAR file. */
  archive(): Promise<Result<Uint8Array>>
  archiveBlock(): Promise<Block>
  toJSON(): KMSMetadataInput
}

export interface DecodeFailure extends Failure {
  name: 'DecodeFailure'
}

export interface SessionSignatureOptions {
  wallet: Wallet
  accessControlConditions: AccessControlConditions
  dataToEncryptHash: string
  expiration?: string
  capabilityAuthSigs?: AuthSig[] // Required if the capacity credit is delegated to the decrypting user
}

export interface PkpSessionSignatureOptions {
  pkpPublicKey: string
  authMethod: AuthMethod
  accessControlConditions: AccessControlConditions
  dataToEncryptHash: string
  expiration?: string
  capabilityAuthSigs?: AuthSig[] // Required if the capacity credit is delegated to the decrypting user
}

export interface LitPkpSigner {
  pkpPublicKey: string
  authMethod: AuthMethod
}

export interface LitWalletSigner {
  wallet: Wallet
}

export interface CreateDecryptWrappedInvocationOptions {
  delegationCAR: Uint8Array
  issuer: Signer<DID, SigAlg>
  audience: `did:${string}:${string}`
  spaceDID: `did:key:${string}`
  resourceCID: AnyLink
  expiration: number
}

export interface ExecuteUcanValidationOptions {
  sessionSigs: SessionSigsMap
  spaceDID: `did:key:${string}`
  identityBoundCiphertext: string
  plaintextKeyHash: string
  accessControlConditions: AccessControlConditions
  wrappedInvocationJSON: string
}

// Strategy-specific metadata types
export type ExtractedMetadata = LitExtractedMetadata | KMSExtractedMetadata

export interface LitExtractedMetadata {
  strategy: 'lit'
  encryptedDataCID: string
  identityBoundCiphertext: string
  plaintextKeyHash: string
  accessControlConditions: AccessControlConditions
}

export interface KMSExtractedMetadata {
  strategy: 'kms'
  encryptedDataCID: string
  encryptedSymmetricKey: string
  space: SpaceDID
  kms: {
    provider: string
    keyId: string
    algorithm: string
    keyReference?: string
  }
}
