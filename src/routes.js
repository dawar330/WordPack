import React from "react";
import { Switch, Route } from "react-router-dom";

import {
  Home,
  Collection,
  Asset,
  Account,
  Explore,
} from "pages";

import { MainLayout } from "layouts";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css";
import Mint from "pages/Mint/Mint";

const RenderRoutes = () => {
  return (
    <Switch>
      <Route exact path="/">
        <MainLayout>
          <Home />
        </MainLayout>
      </Route>
      <Route exact path="/collection/:collection_id">
        <MainLayout>
          <Collection />
        </MainLayout>
      </Route>
      <Route exact path="/assets/:policy_id/:asset_id">
        <MainLayout>
          <Asset />
        </MainLayout>
      </Route>
      <Route exact path="/account">
        <MainLayout>
          <Account />
        </MainLayout>
      </Route>
      <Route exact path="/explore">
        <MainLayout>
          <Explore />
        </MainLayout>
      </Route>
      <Route exact path="/mint">
        <MainLayout>
          <Mint />
        </MainLayout>
      </Route>
    </Switch>
  );
};

export default RenderRoutes;
