import { v2 as cloudinary } from 'cloudinary';
import { Network } from '@prisma/client';

import { cloudinaryEnvs } from '../env';

cloudinary.config({
  cloud_name: cloudinaryEnvs.cloudName,
  api_key: cloudinaryEnvs.apiKey,
  api_secret: cloudinaryEnvs.apiSecret,
  secure: true,
});

enum CLOUDINARY_FOLDERS {
  TOKEN_LOGOS_ROPSTEN = 'tokenLogosRopsten',
  TOKEN_LOGOS_MAINNET = 'tokenLogosMainnet',
}

const PARASWAP_DEFAULT_IMG = 'token.png';

export const uploadTokenLogo = async (
  tokenUri: string,
  tokenID: string,
  network: Network,
): Promise<string | null> => {
  const storageFolder =
    network === Network.ETHEREUM
      ? CLOUDINARY_FOLDERS.TOKEN_LOGOS_MAINNET
      : CLOUDINARY_FOLDERS.TOKEN_LOGOS_ROPSTEN;
  return uploadImgToCloudinary(tokenUri, tokenID, storageFolder);
};

const uploadImgToCloudinary = async (
  imgUri: string,
  tokenID: string,
  folderName: string,
): Promise<string | null> => {
  // Checks that the img is not default one
  if (imgUri.toLowerCase().includes(PARASWAP_DEFAULT_IMG)) {
    return null;
  }

  try {
    // Checks if the img is already on the cdn
    const existingResource = await cloudinary.api.resource(tokenID);
    return existingResource.url;
  } catch (error) {
    try {
      console.log(`Uploading file: ${imgUri} with tokenID: ${tokenID} to cloudinary...`);
      const result = await cloudinary.uploader.upload(imgUri, {
        public_id: tokenID,
        folder: folderName,
      });
      return result.url;
    } catch (error) {
      console.error('Error uploading file!', error);
    }
  }
  return null;
};
