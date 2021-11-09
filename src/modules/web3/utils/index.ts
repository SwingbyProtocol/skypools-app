import ABI from 'human-standard-token-abi';
import Web3 from 'web3';

export const getDecimals = async ({
  provider,
  token,
}: {
  provider: any;
  token: string;
}): Promise<number> => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(ABI, token);
  return await contract.methods.decimals().call();
};
