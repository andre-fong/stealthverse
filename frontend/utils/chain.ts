import * as chains from "viem/chains";
import { Address, PublicClient, Abi } from "viem";

function getChainById(chainId: number) {
  const id = Number(chainId);
  return Object.values(chains).find((chain) => chain && chain.id === id);
}

async function estimateGasForContract({
  publicClient,
  chainId,
  account,
  address,
  abi,
  functionName,
  args = [],
  value,
}: {
  publicClient: PublicClient;
  chainId: number;
  account: Address;
  address: Address;
  abi: Abi | any;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
}) {
  const chain = getChainById(chainId);
  return publicClient.estimateContractGas({
    account,
    address,
    abi,
    functionName,
    args,
    value,
  });
}

export { getChainById, estimateGasForContract };
