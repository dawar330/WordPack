import { async } from "@firebase/util";
import { MintAsset } from "cardano/market-contract";
import Wallet from "../../cardano/wallet";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../Home/style.scss";
import ImageUpload from "./ImageUploader";
import * as Cardano from "@emurgo/cardano-serialization-lib-asmjs";
import { cardano } from "cardano/blockfrost-api";
import Spinner from "./Loader";
import { loadAssets } from "store/wallet/api";
import { toHex } from "utils/converter";
import NotConnected from "../Account/NotConnected";

export async function waitForTransaction(tx, setisMinting) {
  try {
    var checkBool = false;
    setisMinting(true);
    while (!checkBool) {
      try {
        const res = await cardano(`txs/${tx}`);
        checkBool = true;
        setisMinting(false);
      } catch (error) {}
    }
    console.log("Complete");
    return "Complete";
  } catch (err) {
    console.error(err);
  }
}
export default function Mint() {
  const state_wallet = useSelector((state) => state.wallet);

  const state_collection = useSelector((state) => state.collection);
  const [AssetName, setAssetName] = React.useState("");
  const [Quantity, setQuantity] = React.useState("");
  const [Author, setAuthor] = React.useState("");
  const [IPFS, setIPFS] = React.useState();
  const [isMinting, setisMinting] = useState(false);
  const default_list_projects = [{ value: "all", label: "All Projects" }];

  const [listProjectsFilter, setListProjectsFilter] = useState([
    ...default_list_projects,
  ]);
  const [listings, setListings] = useState([]);
  const dispatch = useDispatch();
  function load() {
    if (state_wallet.loaded_assets) {
      let list_nfts = [];
      let list_projects = [...default_list_projects];
      let dict_projects = {};

      for (var i in state_wallet.data.assets) {
        let this_asset = state_wallet.data.assets[i];
        if (this_asset) {
          list_nfts.push(this_asset);

          let policy_id = this_asset.details.policyId;

          if (policy_id in state_collection.policies_collections) {
            dict_projects[policy_id] =
              state_collection.policies_collections[policy_id].meta.name;
          } else {
            dict_projects[policy_id] = policy_id;
          }
        }
      }
      setListings(list_nfts);

      for (var policy_id in dict_projects) {
        list_projects.push({
          value: policy_id,
          label: dict_projects[policy_id],
        });
      }
      setListProjectsFilter(list_projects);
    }
  }
  async function MintToken(IPFS) {
    const walletUtxos = await Wallet.getUtxos();
    const { txHash, policyId } = await MintAsset(
      {
        address: Cardano.BaseAddress.from_address(
          Cardano.Address.from_bech32(state_wallet.data.address)
        ),
        utxos: walletUtxos,
      },
      AssetName,
      Quantity,
      Author,
      IPFS
    );
    await waitForTransaction(txHash, setisMinting);
    dispatch(
      loadAssets(state_wallet, (res) => {
        load();
      })
    );
    window.location.href = `/assets/${policyId}/${policyId}${toHex(AssetName)}`;
  }
  return (

  !state_wallet.connected ? (
      <NotConnected/>
  ) : <>
    <div style={{ height: "85vh" }} className="mint-container">
      <Spinner loading={isMinting} />
      <div className="mint-box zoom">
        <div>
          {" "}
          <ImageUpload setIPFS={setIPFS} />
          <input placeholder="Name"
          className="input is-rounded m-y"
            value={AssetName}
            onChange={(e) => {
              setAssetName(e.target.value);
            }}
          />
        </div>
        <div>
          {" "}
          <input placeholder="Quantity" 
          type="number"
          className="input is-rounded m-y"
            value={Quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
            }}
          />
        </div>
        <div>
          {" "}
          <input placeholder="Author"
          className="input is-rounded m-y"
            value={Author}
            onChange={(e) => {
              setAuthor(e.target.value);
            }}
          />
        </div>
        <button
        className="button is-rounded is-info m-y m-auto"
          onClick={async () => {
            await MintToken(IPFS);
          }}
          
        >
          MInt NFT
        </button>
      </div>
    </div>
  </>

  );
}
