import React from "react";

import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import "./loader.css";
import Loader from "react-js-loader";

function Spinner({ loading }) {
  const useStyles = makeStyles((theme) => ({
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
  }));
  const classes = useStyles();

  return (
    <div>
      <Modal
        id="loading"
        aria-labelledby="transition-Dialog-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        closeAfterTransition
        open={loading}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 15000,
        }}
        hideBackdrop={!loading}
      >
        <Fade in={loading}>
          <Loader
            type="spinner-default"
            bgColor={"#fff"}
            color={"#FFFFFF"}
            size={150}
          />
        </Fade>
      </Modal>
    </div>
  );
}
export default Spinner;
