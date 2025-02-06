import { getInput, setFailed } from '@actions/core';
import pinataSDK from '@pinata/sdk';

const run = async () => {
  const pinataApiKey = getInput('pinataApiKey');
  const pinataSecretApiKey = getInput('pinataSecretApiKey');
  const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey);

  try {
    await pinata.testAuthentication();
    console.log('Successfully authenticated with Pinata');
  } catch (error) {
    console.log('Failed authenticating with Pinata');
    setFailed(error as string);
  }

  try {
    const path = getInput('path');
    const name = getInput('name');

    const result = await pinata.pinFromFS(path, {
      pinataMetadata: {
        name,
      },
    });

    // TODO: delete old pins

    return result.IpfsHash;
  } catch (error) {
    console.log('Pinning failed');
    setFailed(error as string);
  }
};

run();
