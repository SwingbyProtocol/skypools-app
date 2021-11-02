/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */

import type { MyContextType } from './src/modules/server__gql-model/context';
import type { Decimal } from '@prisma/client/runtime';

declare global {
  interface NexusGenCustomOutputProperties<TypeName extends string> {
    model: NexusPrisma<TypeName, 'model'>;
    crud: any;
  }
}

declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  BigIntFilter: {
    // input type
    equals?: NexusGenScalars['BigInt'] | null; // BigInt
    gt?: NexusGenScalars['BigInt'] | null; // BigInt
    gte?: NexusGenScalars['BigInt'] | null; // BigInt
    in?: Array<NexusGenScalars['BigInt'] | null> | null; // [BigInt]
    lt?: NexusGenScalars['BigInt'] | null; // BigInt
    lte?: NexusGenScalars['BigInt'] | null; // BigInt
    not?: NexusGenInputs['BigIntFilter'] | null; // BigIntFilter
    notIn?: Array<NexusGenScalars['BigInt'] | null> | null; // [BigInt]
  };
  DateTimeFilter: {
    // input type
    equals?: NexusGenScalars['DateTime'] | null; // DateTime
    gt?: NexusGenScalars['DateTime'] | null; // DateTime
    gte?: NexusGenScalars['DateTime'] | null; // DateTime
    in?: Array<NexusGenScalars['DateTime'] | null> | null; // [DateTime]
    lt?: NexusGenScalars['DateTime'] | null; // DateTime
    lte?: NexusGenScalars['DateTime'] | null; // DateTime
    not?: NexusGenInputs['DateTimeFilter'] | null; // DateTimeFilter
    notIn?: Array<NexusGenScalars['DateTime'] | null> | null; // [DateTime]
  };
  DecimalFilter: {
    // input type
    equals?: NexusGenScalars['Decimal'] | null; // Decimal
    gt?: NexusGenScalars['Decimal'] | null; // Decimal
    gte?: NexusGenScalars['Decimal'] | null; // Decimal
    in?: Array<NexusGenScalars['Decimal'] | null> | null; // [Decimal]
    lt?: NexusGenScalars['Decimal'] | null; // Decimal
    lte?: NexusGenScalars['Decimal'] | null; // Decimal
    not?: NexusGenInputs['DecimalFilter'] | null; // DecimalFilter
    notIn?: Array<NexusGenScalars['Decimal'] | null> | null; // [Decimal]
  };
  IdFilter: {
    // input type
    equals?: string | null; // ID
    gt?: string | null; // ID
    gte?: string | null; // ID
    in?: Array<string | null> | null; // [ID]
    lt?: string | null; // ID
    lte?: string | null; // ID
    not?: NexusGenInputs['IdFilter'] | null; // IdFilter
    notIn?: Array<string | null> | null; // [ID]
  };
  IntFilter: {
    // input type
    equals?: number | null; // Int
    gt?: number | null; // Int
    gte?: number | null; // Int
    in?: Array<number | null> | null; // [Int]
    lt?: number | null; // Int
    lte?: number | null; // Int
    not?: NexusGenInputs['IntFilter'] | null; // IntFilter
    notIn?: Array<number | null> | null; // [Int]
  };
  NetworkEnumFilter: {
    // input type
    equals?: NexusGenEnums['Network'] | null; // Network
    in?: Array<NexusGenEnums['Network'] | null> | null; // [Network]
    not?: NexusGenInputs['NetworkEnumFilter'] | null; // NetworkEnumFilter
    notIn?: Array<NexusGenEnums['Network'] | null> | null; // [Network]
  };
  StringArrayFilter: {
    // input type
    equals?: string[] | null; // [String!]
    has?: string | null; // String
    hasEvery?: string[] | null; // [String!]
    isEmpty?: boolean | null; // Boolean
  };
  StringFilter: {
    // input type
    contains?: string | null; // String
    endsWith?: string | null; // String
    equals?: string | null; // String
    gt?: string | null; // String
    gte?: string | null; // String
    in?: Array<string | null> | null; // [String]
    lt?: string | null; // String
    lte?: string | null; // String
    mode?: NexusGenEnums['StringFilterMode'] | null; // StringFilterMode
    not?: NexusGenInputs['StringFilter'] | null; // StringFilter
    notIn?: Array<string | null> | null; // [String]
    startsWith?: string | null; // String
  };
  SwapWhereInput: {
    // input type
    AND?: Array<NexusGenInputs['SwapWhereInput'] | null> | null; // [SwapWhereInput]
    NOT?: NexusGenInputs['SwapWhereInput'] | null; // SwapWhereInput
    OR?: Array<NexusGenInputs['SwapWhereInput'] | null> | null; // [SwapWhereInput]
    beneficiaryAddress?: NexusGenInputs['StringFilter'] | null; // StringFilter
    createdAt?: NexusGenInputs['DateTimeFilter'] | null; // DateTimeFilter
    destAmount?: NexusGenInputs['DecimalFilter'] | null; // DecimalFilter
    destToken?: NexusGenInputs['TokenWhereInput'] | null; // TokenWhereInput
    id?: NexusGenInputs['IdFilter'] | null; // IdFilter
    initiatorAddress?: NexusGenInputs['StringFilter'] | null; // StringFilter
    network?: NexusGenInputs['NetworkEnumFilter'] | null; // NetworkEnumFilter
    skybridgeSwapId?: NexusGenInputs['StringFilter'] | null; // StringFilter
    skypoolsTransactionHashes?: NexusGenInputs['StringArrayFilter'] | null; // StringArrayFilter
    srcAmount?: NexusGenInputs['DecimalFilter'] | null; // DecimalFilter
    srcToken?: NexusGenInputs['TokenWhereInput'] | null; // TokenWhereInput
    updatedAt?: NexusGenInputs['DateTimeFilter'] | null; // DateTimeFilter
  };
  TokenWhereInput: {
    // input type
    AND?: Array<NexusGenInputs['TokenWhereInput'] | null> | null; // [TokenWhereInput]
    NOT?: NexusGenInputs['TokenWhereInput'] | null; // TokenWhereInput
    OR?: Array<NexusGenInputs['TokenWhereInput'] | null> | null; // [TokenWhereInput]
    address?: NexusGenInputs['StringFilter'] | null; // StringFilter
    createdAt?: NexusGenInputs['DateTimeFilter'] | null; // DateTimeFilter
    decimals?: NexusGenInputs['IntFilter'] | null; // IntFilter
    id?: NexusGenInputs['StringFilter'] | null; // StringFilter
    logoUri?: NexusGenInputs['StringFilter'] | null; // StringFilter
    network?: NexusGenInputs['NetworkEnumFilter'] | null; // NetworkEnumFilter
    symbol?: NexusGenInputs['StringFilter'] | null; // StringFilter
    updatedAt?: NexusGenInputs['DateTimeFilter'] | null; // DateTimeFilter
  };
}

export interface NexusGenEnums {
  Network: 'BSC' | 'ETHEREUM' | 'ROPSTEN';
  StringFilterMode: 'default' | 'insensitive';
  SwapStatus: 'COMPLETED' | 'FAILED' | 'PENDING';
}

export interface NexusGenScalars {
  String: string;
  Int: number;
  Float: number;
  Boolean: boolean;
  ID: string;
  BigInt: BigInt;
  DateTime: Date;
  Decimal: Decimal;
}

export interface NexusGenObjects {
  ForwardPaginationPageInfo: {
    // root type
    endCursor: string; // String!
    hasNextPage: boolean; // Boolean!
    hasPreviousPage: boolean; // Boolean!
    startCursor: string; // String!
  };
  Mutation: {};
  PriceHistoricItem: {
    // root type
    at: NexusGenScalars['DateTime']; // DateTime!
    price: NexusGenScalars['Decimal']; // Decimal!
  };
  Query: {};
  Swap: {
    // root type
    beneficiaryAddress: string; // String!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    destAmount: NexusGenScalars['Decimal']; // Decimal!
    destToken: NexusGenRootTypes['Token']; // Token!
    id: string; // ID!
    initiatorAddress: string; // String!
    network: NexusGenEnums['Network']; // Network!
    paraSwapRate: string; // String!
    skybridgeSwapId?: string | null; // String
    skypoolsTransactionHashes: string[]; // [String!]!
    srcAmount: NexusGenScalars['Decimal']; // Decimal!
    srcToken: NexusGenRootTypes['Token']; // Token!
    status: NexusGenEnums['SwapStatus']; // SwapStatus!
    updatedAt: NexusGenScalars['DateTime']; // DateTime!
  };
  SwapQuote: {
    // root type
    bestRoute: NexusGenRootTypes['SwapQuoteBestRoute']; // SwapQuoteBestRoute!
    destToken: NexusGenRootTypes['Token']; // Token!
    destTokenPriceUsd: NexusGenScalars['Decimal']; // Decimal!
    nativeTokenPriceUsd: NexusGenScalars['Decimal']; // Decimal!
    otherExchanges: NexusGenRootTypes['SwapQuoteOtherExchange'][]; // [SwapQuoteOtherExchange!]!
    srcToken: NexusGenRootTypes['Token']; // Token!
    srcTokenAmount: NexusGenScalars['Decimal']; // Decimal!
    srcTokenAmountUsd: NexusGenScalars['Decimal']; // Decimal!
    srcTokenPriceUsd: NexusGenScalars['Decimal']; // Decimal!
  };
  SwapQuoteBestRoute: {
    // root type
    destTokenAmount: NexusGenScalars['Decimal']; // Decimal!
    destTokenAmountUsd: NexusGenScalars['Decimal']; // Decimal!
    estimatedGas: NexusGenScalars['Decimal']; // Decimal!
    estimatedGasUsd: NexusGenScalars['Decimal']; // Decimal!
    path: NexusGenRootTypes['SwapQuotePathItem'][]; // [SwapQuotePathItem!]!
    spender: string; // String!
  };
  SwapQuoteOtherExchange: {
    // root type
    destTokenAmount: NexusGenScalars['Decimal']; // Decimal!
    destTokenAmountUsd: NexusGenScalars['Decimal']; // Decimal!
    estimatedGas: NexusGenScalars['Decimal']; // Decimal!
    estimatedGasUsd: NexusGenScalars['Decimal']; // Decimal!
    exchange: string; // String!
    fractionOfBest: NexusGenScalars['Decimal']; // Decimal!
  };
  SwapQuotePathItem: {
    // root type
    fraction: NexusGenScalars['Decimal']; // Decimal!
    swaps: NexusGenRootTypes['SwapQuotePathSwapsItem'][]; // [SwapQuotePathSwapsItem!]!
  };
  SwapQuotePathSwapsExchangesItem: {
    // root type
    destTokenAmount?: NexusGenScalars['Decimal'] | null; // Decimal
    exchange: string; // String!
    fraction: NexusGenScalars['Decimal']; // Decimal!
    srcTokenAmount: NexusGenScalars['Decimal']; // Decimal!
  };
  SwapQuotePathSwapsItem: {
    // root type
    destToken?: NexusGenRootTypes['Token'] | null; // Token
    destTokenAddress: string; // String!
    exchanges: NexusGenRootTypes['SwapQuotePathSwapsExchangesItem'][]; // [SwapQuotePathSwapsExchangesItem!]!
    srcToken?: NexusGenRootTypes['Token'] | null; // Token
    srcTokenAddress: string; // String!
  };
  SwapsConnection: {
    // root type
    edges: NexusGenRootTypes['SwapsConnectionEdges'][]; // [SwapsConnectionEdges!]!
    pageInfo: NexusGenRootTypes['ForwardPaginationPageInfo']; // ForwardPaginationPageInfo!
    totalCount: number; // Int!
  };
  SwapsConnectionEdges: {
    // root type
    cursor: string; // String!
    node: NexusGenRootTypes['Swap']; // Swap!
  };
  Token: {
    // root type
    address: string; // String!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    decimals: number; // Int!
    id: string; // String!
    logoUri?: string | null; // String
    network: NexusGenEnums['Network']; // Network!
    symbol: string; // String!
    updatedAt: NexusGenScalars['DateTime']; // DateTime!
  };
  TokensConnection: {
    // root type
    edges: NexusGenRootTypes['TokensConnectionEdges'][]; // [TokensConnectionEdges!]!
    pageInfo: NexusGenRootTypes['ForwardPaginationPageInfo']; // ForwardPaginationPageInfo!
    totalCount: number; // Int!
  };
  TokensConnectionEdges: {
    // root type
    cursor: string; // String!
    node: NexusGenRootTypes['Token']; // Token!
  };
}

export interface NexusGenInterfaces {}

export interface NexusGenUnions {}

export type NexusGenRootTypes = NexusGenObjects;

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums;

export interface NexusGenFieldTypes {
  ForwardPaginationPageInfo: {
    // field return type
    endCursor: string; // String!
    hasNextPage: boolean; // Boolean!
    hasPreviousPage: boolean; // Boolean!
    startCursor: string; // String!
  };
  Mutation: {
    // field return type
    createSwap: NexusGenRootTypes['Swap']; // Swap!
  };
  PriceHistoricItem: {
    // field return type
    at: NexusGenScalars['DateTime']; // DateTime!
    price: NexusGenScalars['Decimal']; // Decimal!
  };
  Query: {
    // field return type
    priceHistoric: NexusGenRootTypes['PriceHistoricItem'][]; // [PriceHistoricItem!]!
    spender: string; // String!
    swap: NexusGenRootTypes['Swap']; // Swap!
    swapQuote: NexusGenRootTypes['SwapQuote']; // SwapQuote!
    swaps: NexusGenRootTypes['SwapsConnection']; // SwapsConnection!
    token: NexusGenRootTypes['Token']; // Token!
    tokens: NexusGenRootTypes['TokensConnection']; // TokensConnection!
  };
  Swap: {
    // field return type
    beneficiaryAddress: string; // String!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    destAmount: NexusGenScalars['Decimal']; // Decimal!
    destToken: NexusGenRootTypes['Token']; // Token!
    id: string; // ID!
    initiatorAddress: string; // String!
    network: NexusGenEnums['Network']; // Network!
    paraSwapRate: string; // String!
    skybridgeSwapId: string | null; // String
    skypoolsTransactionHashes: string[]; // [String!]!
    srcAmount: NexusGenScalars['Decimal']; // Decimal!
    srcToken: NexusGenRootTypes['Token']; // Token!
    status: NexusGenEnums['SwapStatus']; // SwapStatus!
    updatedAt: NexusGenScalars['DateTime']; // DateTime!
  };
  SwapQuote: {
    // field return type
    bestRoute: NexusGenRootTypes['SwapQuoteBestRoute']; // SwapQuoteBestRoute!
    destToken: NexusGenRootTypes['Token']; // Token!
    destTokenPriceUsd: NexusGenScalars['Decimal']; // Decimal!
    nativeTokenPriceUsd: NexusGenScalars['Decimal']; // Decimal!
    otherExchanges: NexusGenRootTypes['SwapQuoteOtherExchange'][]; // [SwapQuoteOtherExchange!]!
    srcToken: NexusGenRootTypes['Token']; // Token!
    srcTokenAmount: NexusGenScalars['Decimal']; // Decimal!
    srcTokenAmountUsd: NexusGenScalars['Decimal']; // Decimal!
    srcTokenPriceUsd: NexusGenScalars['Decimal']; // Decimal!
  };
  SwapQuoteBestRoute: {
    // field return type
    destTokenAmount: NexusGenScalars['Decimal']; // Decimal!
    destTokenAmountUsd: NexusGenScalars['Decimal']; // Decimal!
    estimatedGas: NexusGenScalars['Decimal']; // Decimal!
    estimatedGasUsd: NexusGenScalars['Decimal']; // Decimal!
    path: NexusGenRootTypes['SwapQuotePathItem'][]; // [SwapQuotePathItem!]!
    spender: string; // String!
  };
  SwapQuoteOtherExchange: {
    // field return type
    destTokenAmount: NexusGenScalars['Decimal']; // Decimal!
    destTokenAmountUsd: NexusGenScalars['Decimal']; // Decimal!
    estimatedGas: NexusGenScalars['Decimal']; // Decimal!
    estimatedGasUsd: NexusGenScalars['Decimal']; // Decimal!
    exchange: string; // String!
    fractionOfBest: NexusGenScalars['Decimal']; // Decimal!
  };
  SwapQuotePathItem: {
    // field return type
    fraction: NexusGenScalars['Decimal']; // Decimal!
    swaps: NexusGenRootTypes['SwapQuotePathSwapsItem'][]; // [SwapQuotePathSwapsItem!]!
  };
  SwapQuotePathSwapsExchangesItem: {
    // field return type
    destTokenAmount: NexusGenScalars['Decimal'] | null; // Decimal
    exchange: string; // String!
    fraction: NexusGenScalars['Decimal']; // Decimal!
    srcTokenAmount: NexusGenScalars['Decimal']; // Decimal!
  };
  SwapQuotePathSwapsItem: {
    // field return type
    destToken: NexusGenRootTypes['Token'] | null; // Token
    destTokenAddress: string; // String!
    exchanges: NexusGenRootTypes['SwapQuotePathSwapsExchangesItem'][]; // [SwapQuotePathSwapsExchangesItem!]!
    srcToken: NexusGenRootTypes['Token'] | null; // Token
    srcTokenAddress: string; // String!
  };
  SwapsConnection: {
    // field return type
    edges: NexusGenRootTypes['SwapsConnectionEdges'][]; // [SwapsConnectionEdges!]!
    pageInfo: NexusGenRootTypes['ForwardPaginationPageInfo']; // ForwardPaginationPageInfo!
    totalCount: number; // Int!
  };
  SwapsConnectionEdges: {
    // field return type
    cursor: string; // String!
    node: NexusGenRootTypes['Swap']; // Swap!
  };
  Token: {
    // field return type
    address: string; // String!
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    decimals: number; // Int!
    id: string; // String!
    logoUri: string | null; // String
    network: NexusGenEnums['Network']; // Network!
    symbol: string; // String!
    updatedAt: NexusGenScalars['DateTime']; // DateTime!
  };
  TokensConnection: {
    // field return type
    edges: NexusGenRootTypes['TokensConnectionEdges'][]; // [TokensConnectionEdges!]!
    pageInfo: NexusGenRootTypes['ForwardPaginationPageInfo']; // ForwardPaginationPageInfo!
    totalCount: number; // Int!
  };
  TokensConnectionEdges: {
    // field return type
    cursor: string; // String!
    node: NexusGenRootTypes['Token']; // Token!
  };
}

export interface NexusGenFieldTypeNames {
  ForwardPaginationPageInfo: {
    // field return type name
    endCursor: 'String';
    hasNextPage: 'Boolean';
    hasPreviousPage: 'Boolean';
    startCursor: 'String';
  };
  Mutation: {
    // field return type name
    createSwap: 'Swap';
  };
  PriceHistoricItem: {
    // field return type name
    at: 'DateTime';
    price: 'Decimal';
  };
  Query: {
    // field return type name
    priceHistoric: 'PriceHistoricItem';
    spender: 'String';
    swap: 'Swap';
    swapQuote: 'SwapQuote';
    swaps: 'SwapsConnection';
    token: 'Token';
    tokens: 'TokensConnection';
  };
  Swap: {
    // field return type name
    beneficiaryAddress: 'String';
    createdAt: 'DateTime';
    destAmount: 'Decimal';
    destToken: 'Token';
    id: 'ID';
    initiatorAddress: 'String';
    network: 'Network';
    paraSwapRate: 'String';
    skybridgeSwapId: 'String';
    skypoolsTransactionHashes: 'String';
    srcAmount: 'Decimal';
    srcToken: 'Token';
    status: 'SwapStatus';
    updatedAt: 'DateTime';
  };
  SwapQuote: {
    // field return type name
    bestRoute: 'SwapQuoteBestRoute';
    destToken: 'Token';
    destTokenPriceUsd: 'Decimal';
    nativeTokenPriceUsd: 'Decimal';
    otherExchanges: 'SwapQuoteOtherExchange';
    srcToken: 'Token';
    srcTokenAmount: 'Decimal';
    srcTokenAmountUsd: 'Decimal';
    srcTokenPriceUsd: 'Decimal';
  };
  SwapQuoteBestRoute: {
    // field return type name
    destTokenAmount: 'Decimal';
    destTokenAmountUsd: 'Decimal';
    estimatedGas: 'Decimal';
    estimatedGasUsd: 'Decimal';
    path: 'SwapQuotePathItem';
    spender: 'String';
  };
  SwapQuoteOtherExchange: {
    // field return type name
    destTokenAmount: 'Decimal';
    destTokenAmountUsd: 'Decimal';
    estimatedGas: 'Decimal';
    estimatedGasUsd: 'Decimal';
    exchange: 'String';
    fractionOfBest: 'Decimal';
  };
  SwapQuotePathItem: {
    // field return type name
    fraction: 'Decimal';
    swaps: 'SwapQuotePathSwapsItem';
  };
  SwapQuotePathSwapsExchangesItem: {
    // field return type name
    destTokenAmount: 'Decimal';
    exchange: 'String';
    fraction: 'Decimal';
    srcTokenAmount: 'Decimal';
  };
  SwapQuotePathSwapsItem: {
    // field return type name
    destToken: 'Token';
    destTokenAddress: 'String';
    exchanges: 'SwapQuotePathSwapsExchangesItem';
    srcToken: 'Token';
    srcTokenAddress: 'String';
  };
  SwapsConnection: {
    // field return type name
    edges: 'SwapsConnectionEdges';
    pageInfo: 'ForwardPaginationPageInfo';
    totalCount: 'Int';
  };
  SwapsConnectionEdges: {
    // field return type name
    cursor: 'String';
    node: 'Swap';
  };
  Token: {
    // field return type name
    address: 'String';
    createdAt: 'DateTime';
    decimals: 'Int';
    id: 'String';
    logoUri: 'String';
    network: 'Network';
    symbol: 'String';
    updatedAt: 'DateTime';
  };
  TokensConnection: {
    // field return type name
    edges: 'TokensConnectionEdges';
    pageInfo: 'ForwardPaginationPageInfo';
    totalCount: 'Int';
  };
  TokensConnectionEdges: {
    // field return type name
    cursor: 'String';
    node: 'Token';
  };
}

export interface NexusGenArgTypes {
  Mutation: {
    createSwap: {
      // args
      beneficiaryAddress: string; // String!
      destTokenId: string; // ID!
      initiatorAddress: string; // String!
      network: NexusGenEnums['Network']; // Network!
      paraSwapRate: string; // String!
      skybridgeSwapId?: string | null; // String
      skypoolsTransactionHash?: string | null; // String
      srcAmount: NexusGenScalars['Decimal']; // Decimal!
      srcTokenId: string; // ID!
    };
  };
  Query: {
    priceHistoric: {
      // args
      firstTokenId: string; // String!
      secondTokenId?: string | null; // String
    };
    spender: {
      // args
      network: NexusGenEnums['Network']; // Network!
    };
    swap: {
      // args
      id: string; // ID!
    };
    swapQuote: {
      // args
      beneficiaryAddress?: string | null; // String
      destTokenAddress: string; // String!
      initiatorAddress: string; // String!
      network: NexusGenEnums['Network']; // Network!
      srcTokenAddress: string; // String!
      srcTokenAmount: NexusGenScalars['Decimal']; // Decimal!
    };
    swaps: {
      // args
      after?: string | null; // String
      before?: string | null; // String
      first?: number | null; // Int
      last?: number | null; // Int
      where?: NexusGenInputs['SwapWhereInput'] | null; // SwapWhereInput
    };
    token: {
      // args
      id: string; // ID!
    };
    tokens: {
      // args
      after?: string | null; // String
      before?: string | null; // String
      first?: number | null; // Int
      last?: number | null; // Int
      where?: NexusGenInputs['TokenWhereInput'] | null; // TokenWhereInput
    };
  };
}

export interface NexusGenAbstractTypeMembers {}

export interface NexusGenTypeInterfaces {}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false;
    resolveType: true;
    __typename: false;
  };
};

export interface NexusGenTypes {
  context: MyContextType;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes:
    | NexusGenTypes['inputNames']
    | NexusGenTypes['enumNames']
    | NexusGenTypes['scalarNames'];
  allOutputTypes:
    | NexusGenTypes['objectNames']
    | NexusGenTypes['enumNames']
    | NexusGenTypes['unionNames']
    | NexusGenTypes['interfaceNames']
    | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes'];
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}

declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {}
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {}
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {}
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {}
  interface NexusGenPluginSchemaConfig {}
  interface NexusGenPluginArgConfig {}
}
