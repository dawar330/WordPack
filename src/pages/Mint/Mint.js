import { async } from "@firebase/util";
import { MintAsset } from "cardano/market-contract";
import Wallet from "../../cardano/wallet";
import React from "react";
import { useSelector } from "react-redux";
import "../Home/style.scss";
import ImageUploader from "./ImageUploader";
import Cardano from "../../cardano/serialization-lib";

export default function Mint() {
  const state_wallet = useSelector((state) => state.wallet);
  async function MintToken() {
    const walletUtxos = await Wallet.getUtxos();
    const txHash = await MintAsset({
      address: Cardano.Instance.BaseAddress.from_address(
        Cardano.Instance.Address.from_bech32(state_wallet.data.address)
      ),
      utxos: walletUtxos,
    });
    console.log(txHash);
  }
  return (
    <div style={{ height: "85vh" }} className="mint-container">
      <div className="mint-box zoom">
        <button
          onClick={async () => {
            await MintToken();
          }}
        >
          MInt NFT
        </button>
      </div>
    </div>
  );
}
