import { getInput, setFailed, setOutput } from '@actions/core';
import pinataSDK, { type PinataPinListResponseRow } from '@pinata/sdk';

const run = async () => {
  const pinataApiKey = getInput('pinataApiKey');
  const pinataApiSecret = getInput('pinataApiSecret');
  const pinata = pinataSDK(pinataApiKey, pinataApiSecret);

  try {
    await pinata.testAuthentication();
    console.log('Successfully authenticated with Pinata');
  } catch (error) {
    setFailed('Failed authenticating with Pinata');
    console.log(error);
    return;
  }

  try {
    const path = getInput('path');
    const pinName = getInput('pinName');

    console.log('Uploading and pinning files to IPFS');
    const { IpfsHash: cid } = await pinata.pinFromFS(path, {
      pinataMetadata: {
        name: pinName,
        // @ts-expect-error - Incorrect typing, this property exists
        keyvalues: {
          tag: pinName, // Will be used to list and delete old records
        },
      },
    });

    console.log('Successfully uploaded and pinned files to IPFS');
    console.log(`CID: ${cid}`);
    console.log(`IPFS preview link: https://ipfs.io/ipfs/${cid}/`);

    // Remove old pins
    const unsafeMaxPinsToKeepInput = getInput('maxPinsToKeep');
    const maxPinsToKeep = unsafeMaxPinsToKeepInput
      ? +unsafeMaxPinsToKeepInput
      : undefined;

    let pins: PinataPinListResponseRow[] = [];

    if (maxPinsToKeep) {
      try {
        const { rows } = await pinata.pinList({
          metadata: {
            name: pinName,
            keyvalues: {
              tag: {
                op: 'eq',
                value: pinName,
              },
            },
          },
          status: 'pinned',
        });

        pins = rows;
      } catch (error) {
        setFailed('Failed to fetch existing pins');
        console.log(error);
        return;
      }
    }

    if (maxPinsToKeep && pins.length > maxPinsToKeep) {
      console.log('Removing old pins');
      const pinsToDelete = pins.slice(maxPinsToKeep);

      try {
        await Promise.all(
          pinsToDelete.reduce<Promise<void>[]>((acc, pin) => {
            // Filter out pins with the same CID as the one that was just created. This can happen
            // if the newly pinned content is exactly the same as an old pin's, in which case Pinata
            // will point to the old pin without updating its date of creation.
            if (pin.ipfs_pin_hash === cid) {
              return acc;
            }

            return [...acc, pinata.unpin(pin.ipfs_pin_hash)];
          }, []),
        );

        console.log('Successfully removed old pins.');
        console.log(`Pins removed: ${pinsToDelete.length}`);
        console.log(pinsToDelete.map((p) => p.ipfs_pin_hash).join(', '));
      } catch (error) {
        setFailed('Failed to remove old pins');
        console.log(error);
        return;
      }
    }

    setOutput('cid', cid);
  } catch (error) {
    setFailed('Uploading and pinning failed');
    console.log(error);
    return;
  }
};

run();
