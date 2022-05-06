import { async } from "@firebase/util";
import { MintAsset } from "cardano/market-contract";
import Wallet from "../../cardano/wallet";
import React from "react";
import { useSelector } from "react-redux";
import "../Home/style.scss";
import ImageUpload from "./ImageUploader";
import * as Cardano from "@emurgo/cardano-serialization-lib-asmjs";

export default function Mint() {
  const state_wallet = useSelector((state) => state.wallet);
  const [AssetName, setAssetName] = React.useState("");
  const [Quantity, setQuantity] = React.useState("");
  const [Author, setAuthor] = React.useState("");

  async function MintToken() {
    const walletUtxos = await Wallet.getUtxos();
    const txHash = await MintAsset(
      {
        address: Cardano.BaseAddress.from_address(
          Cardano.Address.from_bech32(state_wallet.data.address)
        ),
        utxos: walletUtxos,
      },
      AssetName,
      Quantity,
      Author
    );
    console.log(txHash);
  }
  return (
    <div style={{ height: "85vh" }} className="mint-container">
      <div className="mint-box zoom">
        <div>
          {" "}
          <ImageUpload />
          <label>Name</label>
          <input
            value={AssetName}
            onChange={(e) => {
              setAssetName(e.target.value);
            }}
          />
        </div>
        <div>
          {" "}
          <label>Quantity</label>
          <input
            value={Quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
            }}
          />
        </div>
        <div>
          {" "}
          <label>Author</label>
          <input
            value={Author}
            onChange={(e) => {
              setAuthor(e.target.value);
            }}
          />
        </div>
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
