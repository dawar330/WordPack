import Cardano from "../serialization-lib";
import * as Cardanoo from "@emurgo/cardano-serialization-lib-asmjs";
import ErrorTypes from "./error.types";
import { serializeSale, deserializeSale } from "./datums";
import { BUYER, MINT, SELLER } from "./redeemers";
import { contractAddress, contractScripts } from "./validator";
import {
  assetsToValue,
  createTxOutput,
  finalizeTx,
  initializeTx,
  initializeTx10,
  serializeTxUnspentOutput,
  serializeTxUnspentOutput10,
} from "../transaction";
import { fromHex, toHex } from "../../utils/converter";
import Wallet from "cardano/wallet";

export const MintAsset = async (
  seller: {
    address: BaseAddress,
    utxos: [],
  },
  AssetName: String,
  Quantity: String,
  Author: String,
  IPFS: String
) => {
  try {
    const { txBuilder } = initializeTx10();
    const utxos = seller.utxos.map((utxo) => serializeTxUnspentOutput10(utxo));

    const nativeScripts = Cardanoo.NativeScripts.new();
    const scriptPubkey = Cardanoo.NativeScript.new_script_pubkey(
      Cardanoo.ScriptPubkey.new(seller.address.payment_cred().to_keyhash())
    );

    nativeScripts.add(scriptPubkey);

    const policyId = Buffer.from(scriptPubkey.hash(0).to_bytes()).toString(
      "hex"
    );
    const MintAssets = Cardanoo.MintAssets.new();
    const assetName = Cardanoo.AssetName.new(Buffer.from(AssetName, "utf8"));
    var assetNumber = Cardanoo.Int.new_i32(parseInt(Quantity));

    MintAssets.insert(assetName, assetNumber);
    assetNumber = Cardanoo.BigNum.from_str(Quantity);

    const MultiAsset = Cardanoo.MultiAsset.new();
    const Assets = Cardanoo.Assets.new();
    Assets.insert(assetName, assetNumber);

    MultiAsset.insert(scriptPubkey.hash(0), Assets);

    // txBuilder.set_mint_asset(nativeScript, MintAssets);

    txBuilder.add_mint_asset_and_output(
      scriptPubkey,
      assetName,
      Cardanoo.Int.new_i32(Quantity),
      Cardanoo.TransactionOutputBuilder.new()
        .with_address(seller.address.to_address())
        .next(),
      Cardanoo.BigNum.from_str("1600000")
    );

    let aux_data = Cardanoo.AuxiliaryData.new();
    const generalMetadata = Cardanoo.GeneralTransactionMetadata.new();
    generalMetadata.insert(
      Cardanoo.BigNum.from_str("721"),
      Cardanoo.encode_json_str_to_metadatum(
        JSON.stringify({
          [policyId]: {
            [AssetName]: {
              image: `ipfs://${IPFS}`,
              name: AssetName,
              Quantity,
              Author,
            },
          },
        }),
        1
      )
    );

    aux_data.set_metadata(generalMetadata);
    aux_data.set_native_scripts(nativeScripts);
    txBuilder.set_auxiliary_data(aux_data);
    const inputs = Cardanoo.TransactionUnspentOutputs.new();

    utxos.forEach((utxo) => {
      inputs.add(utxo);
    });
    txBuilder.add_inputs_from(inputs, 2);
    // txBuilder.add_inputs_from(utxos, 2);

    txBuilder.add_change_if_needed(seller.address.to_address());
    const tx = txBuilder.build_tx();

    let txVkeyWitnesses = await Wallet.signTx(toHex(tx.to_bytes()), true);

    txVkeyWitnesses = Cardanoo.TransactionWitnessSet.from_bytes(
      fromHex(txVkeyWitnesses)
    );
    txVkeyWitnesses.set_native_scripts(nativeScripts);

    const signedTx = Cardanoo.Transaction.new(
      tx.body(),
      txVkeyWitnesses,
      tx.auxiliary_data()
    );
    const txHash = await Wallet.submitTx(toHex(signedTx.to_bytes()));
    return txHash;
  } catch (error) {
    console.log(error, "MintAsset");
  }
};
export const listAsset = async (
  datum,
  seller: { address: BaseAddress, utxos: [] },
  version
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();
    const utxos = seller.utxos.map((utxo) => serializeTxUnspentOutput(utxo));

    const lockAssetDatum = serializeSale(datum);
    datums.add(lockAssetDatum);

    outputs.add(
      createTxOutput(
        contractAddress(version),
        assetsToValue([
          {
            unit: `${datum.cs}${datum.tn}`,
            quantity: "1",
          },
          { unit: "lovelace", quantity: "2000000" },
        ]),
        { datum: lockAssetDatum }
      )
    );

    const datumHash = toHex(
      Cardano.Instance.hash_plutus_data(lockAssetDatum).to_bytes()
    );

    const txHash = await finalizeTx({
      txBuilder,
      datums,
      utxos,
      outputs,
      changeAddress: seller.address,
      metadata: deserializeSale(lockAssetDatum),
    });
    return {
      datumHash,
      txHash,
    };
  } catch (error) {
    handleError(error, "listAsset");
  }
};

export const updateListing = async (
  currentDatum,
  newDatum,
  seller: { address: BaseAddress, utxos: [] },
  assetUtxo,
  currentVersion,
  latestVersion
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();
    const utxos = seller.utxos.map((utxo) => serializeTxUnspentOutput(utxo));

    const currentListingDatum = serializeSale(currentDatum);
    datums.add(currentListingDatum);

    const newListingDatum = serializeSale(newDatum);
    datums.add(newListingDatum);

    outputs.add(
      createTxOutput(
        contractAddress(latestVersion),
        assetUtxo.output().amount(),
        {
          datum: newListingDatum,
        }
      )
    );

    const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
    requiredSigners.add(seller.address.payment_cred().to_keyhash());
    txBuilder.set_required_signers(requiredSigners);

    const datumHash = toHex(
      Cardano.Instance.hash_plutus_data(newListingDatum).to_bytes()
    );

    const txHash = await finalizeTx({
      txBuilder,
      datums,
      utxos,
      outputs,
      changeAddress: seller.address,
      metadata: deserializeSale(newListingDatum),
      assetUtxo,
      plutusScripts: contractScripts(currentVersion),
      action: SELLER,
    });

    return {
      datumHash,
      txHash,
    };
  } catch (error) {
    handleError(error, "updateListing");
  }
};

export const cancelListing = async (
  datum,
  seller: { address: BaseAddress, utxos: [] },
  assetUtxo,
  version
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();
    const utxos = seller.utxos.map((utxo) => serializeTxUnspentOutput(utxo));

    const cancelListingDatum = serializeSale(datum);
    datums.add(cancelListingDatum);

    outputs.add(
      createTxOutput(seller.address.to_address(), assetUtxo.output().amount())
    );

    const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
    requiredSigners.add(seller.address.payment_cred().to_keyhash());
    txBuilder.set_required_signers(requiredSigners);

    const txHash = await finalizeTx({
      txBuilder,
      datums,
      utxos,
      outputs,
      changeAddress: seller.address,
      assetUtxo,
      plutusScripts: contractScripts(version),
      action: SELLER,
    });

    return txHash;
  } catch (error) {
    handleError(error, "cancelListing");
  }
};

export const purchaseAsset = async (
  datum,
  buyer: { address: BaseAddress, utxos: [] },
  beneficiaries: {
    seller: BaseAddress,
    artist: BaseAddress,
    market: BaseAddress,
  },
  assetUtxo,
  version
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();
    const utxos = buyer.utxos.map((utxo) => serializeTxUnspentOutput(utxo));

    const purchaseAssetDatum = serializeSale(datum);
    datums.add(purchaseAssetDatum);

    outputs.add(
      createTxOutput(buyer.address.to_address(), assetUtxo.output().amount())
    );

    splitAmount(
      beneficiaries,
      {
        price: datum.price,
        royalties: datum.rp,
      },
      outputs
    );

    const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
    requiredSigners.add(buyer.address.payment_cred().to_keyhash());
    txBuilder.set_required_signers(requiredSigners);

    const txHash = await finalizeTx({
      txBuilder,
      utxos,
      outputs,
      datums,
      changeAddress: buyer.address,
      assetUtxo,
      plutusScripts: contractScripts(version),
      action: BUYER,
    });

    return txHash;
  } catch (error) {
    handleError(error, "purchaseAsset");
  }
};

const handleError = (error, source) => {
  console.error(`Unexpected error in ${source}. [Message: ${error.message}]`);

  switch (error.message) {
    case "INPUT_LIMIT_EXCEEDED":
      throw new Error(ErrorTypes.TRANSACTION_FAILED_SO_MANY_UTXOS);
    case "INPUTS_EXHAUSTED":
      throw new Error(ErrorTypes.TRANSACTION_FAILED_NOT_ENOUGH_FUNDS);
    case "MIN_UTXO_ERROR":
      throw new Error(ErrorTypes.TRANSACTION_FAILED_CHANGE_TOO_SMALL);
    case "MAX_SIZE_REACHED":
      throw new Error(ErrorTypes.TRANSACTION_FAILED_MAX_TX_SIZE_REACHED);
    default:
      if (error.message.search("NonOutputSupplimentaryDatums") !== -1) {
        throw new Error(ErrorTypes.TRANSACTION_FAILED_DATUMS_NOT_MATCHING);
      } else if (error.message.search("MissingScriptWitnessesUTXOW") !== -1) {
        throw new Error(ErrorTypes.TRANSACTION_FAILED_WRONG_SCRIPT_CONTRACT);
      } else if (error.message.search("OutputTooSmallUTxO") !== -1) {
        throw new Error(ErrorTypes.TRANSACTION_FAILED_ASSET_NOT_SPENDABLE);
      }
      throw error;
  }
};

const splitAmount = (
  { seller, artist, market },
  { price, royalties },
  outputs
) => {
  const minimumAmount = 1000000;
  const marketFeePercentage = 2 / 100;
  const royaltyFeePercentage = royalties / 1000;
  const royaltyFees = Math.max(royaltyFeePercentage * price, minimumAmount);
  if (royalties > 0) {
    outputs.add(
      createTxOutput(
        artist.to_address(),
        assetsToValue([{ unit: "lovelace", quantity: `${royaltyFees}` }])
      )
    );
  }

  const marketFees = Math.max(marketFeePercentage * price, minimumAmount);
  outputs.add(
    createTxOutput(
      market.to_address(),
      assetsToValue([{ unit: "lovelace", quantity: `${marketFees}` }])
    )
  );

  var netPrice = price - royaltyFeePercentage * price;
  netPrice = netPrice - marketFeePercentage * price;

  outputs.add(
    createTxOutput(
      seller.to_address(),
      assetsToValue([
        { unit: "lovelace", quantity: `${Math.max(netPrice, minimumAmount)}` },
      ])
    )
  );
};
