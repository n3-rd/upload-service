import type {
  ContextState,
  ContextActions,
  ServiceConfig,
} from '@storacha/ui-core'

import { createContext, useContext, ReactNode } from 'react'
import { useDatamodel } from '../hooks.js'

export { ContextState, ContextActions }

export type ContextValue = [state: ContextState, actions: ContextActions]

export const ContextDefaultValue: ContextValue = [
  {
    client: undefined,
    accounts: [],
    spaces: [],
  },
  {
    logout: async () => {
      throw new Error('missing logout function')
    },
  },
]

export const Context = createContext<ContextValue>(ContextDefaultValue)

export interface ProviderProps extends ServiceConfig {
  children?: ReactNode
  receiptsEndpoint?: URL
  skipInitialClaim?: boolean
}

/**
 * W3UI provider.
 */
export function Provider({
  children,
  servicePrincipal,
  connection,
  receiptsEndpoint,
  skipInitialClaim,
}: ProviderProps): ReactNode {
  const { client, accounts, spaces, logout } = useDatamodel({
    servicePrincipal,
    connection,
    receiptsEndpoint,
    skipInitialClaim,
  })
  return (
    <Context.Provider value={[{ client, accounts, spaces }, { logout }]}>
      {children}
    </Context.Provider>
  )
}

/**
 * Use the scoped core context state from a parent Provider.
 */
export function useW3(): ContextValue {
  return useContext(Context)
}
