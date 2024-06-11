import {
    Abi,
    Account,
    AllowArray,
    Call,
    DeclareContractPayload,
    DeclareContractResponse,
    InvocationsDetails,
    InvokeFunctionResponse,
    ProviderInterface,
    RpcProvider,
    Signature,
    TypedData,
    UniversalDetails,
    defaultProvider,
    ec,
    typedData,
  } from "starknet"
  
  import { sendMessage, SignMessageOptions, waitForMessage } from "./messageActions"

  export class RivetAccount extends Account {
    constructor(address: string, pk: string, provider?: ProviderInterface) {
        super(provider || defaultProvider, address, pk)
    }
  
    public async execute(
        transactions: AllowArray<Call>,
        abis?: Abi[] | UniversalDetails,
        transactionsDetail?: UniversalDetails
    ): Promise<InvokeFunctionResponse> {
        sendMessage({
            type: "EXECUTE_RIVET_TRANSACTION",
            data: {
            transactions,
            abis,
            transactionsDetail,
            },
        })

        const response = await waitForMessage("EXECUTE_RIVET_TRANSACTION_RES", 10 * 60 * 1000)
    
        return {
            transaction_hash: response.transaction_hash,
        }
    }

    public async declare(
      { contract, classHash, casm, compiledClassHash }: DeclareContractPayload,
      _transactionsDetail?: InvocationsDetails | undefined,
    ): Promise<DeclareContractResponse> {
      sendMessage({
        type: "REQUEST_RIVET_DECLARE_CONTRACT",
        data: {
          payload: {
            contract,
            classHash,
            casm,
            compiledClassHash,
          },
        },
      })
      const { actionHash } = await waitForMessage(
        "REQUEST_RIVET_DECLARE_CONTRACT_RES",
        1000,
      )

      const result = await Promise.race([
        waitForMessage("REQUEST_RIVET_DECLARE_CONTRACT_RES", 10 * 60 * 1000),
        waitForMessage(
          "DECLARE_RIVET_CONTRACT_ACTION_FAILED",
          10 * 60 * 1000,
        )
      ])
     
      if (result === "error") {
        throw Error("User abort")
      }
      if (result === "timeout") {
        throw Error("User action timed out")
      }
   
      return {
        transaction_hash: result.txHash,
        class_hash: result.classHash,
      }
    }

    public async signMessage(
      typedData: TypedData,
      options: SignMessageOptions = { skipDeploy: false },
    ): Promise<Signature> {
      sendMessage({ type: "SIGN_RIVET_MESSAGE", data: { typedData, options } })
      
      const response = await Promise.race([
        waitForMessage("SIGN_RIVET_MESSAGE_RES", 10 * 60 * 1000),
        waitForMessage(
          "SIGNATURE_RIVET_FAILURE",
          10 * 60 * 1000,
        )
      ])
      
      if (response.error) {
          throw Error("User abort")
      }
  
      return response.signature
    }

  }