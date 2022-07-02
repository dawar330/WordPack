import React, { useState} from "react";
import { useSelector } from "react-redux";

import AllAssets from "./AllAssets";
import Holdings from "./Holdings";
import Listings from "./Listings";
import Events from "./Events";
import NotConnected from "./NotConnected";

const Account = () => {
  const state_wallet = useSelector(state => state.wallet)
  const state_collection = useSelector(state => state.collection)

  return (
    <>
      {
        !state_wallet.connected ? (
          <NotConnected/>
        ) : <></>
      }
      {
        state_wallet.connected ? (
          <Connected state_wallet={state_wallet} state_collection={state_collection} />
        ) : <></>
      }
    </>
  );
};

const Connected = ({state_wallet, state_collection}) => {

  const TABS = {
    ALL_ASSETS: {
      label: "Assets",
      icon: "far fa-images",
    },
    /*HOLDINGS: {
      label: "Holdings",
      icon: "far fa-images",
    },
    LISTINGS: {
      label: "Listings",
      icon: "far fa-images",
    },*/
    EVENTS: {
      label: "Events",
      icon: "far fa-envelope",
    },
  }
  const [displayTab, setDisplayTab] = useState("ALL_ASSETS");

  return (
    <section className="section">
      <div className="tabs is-boxed">
        <ul>
          {
            Object.keys(TABS).map((key, i)=>{
              return (
                <li className={displayTab===key?"is-active":""} onClick={() => setDisplayTab(key)} key={i}>
                  <a>
                    <span className="icon is-small"><i className={TABS[key].icon} aria-hidden="true"></i></span>
                    <span>{TABS[key].label}</span>
                  </a>
                </li>
              )
            })
          }
        </ul>
      </div>

      { displayTab === "ALL_ASSETS" ? <AllAssets state_wallet={state_wallet} state_collection={state_collection} /> : <></> }
      {/* displayTab === "HOLDINGS" ? <Holdings state_wallet={state_wallet} state_collection={state_collection} /> : <></> }
      { displayTab === "LISTINGS" ? <Listings state_wallet={state_wallet} state_collection={state_collection} /> : <></> */}
      { displayTab === "EVENTS" ? <Events state_wallet={state_wallet} state_collection={state_collection} /> : <></> }

    </section>
  )
}
export default Account;
