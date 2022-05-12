import { async } from "@firebase/util";
import { addIpfs } from "cardano/blockfrost-api";
import React from "react";

class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { file: "", imagePreviewUrl: "" };
  }

  async _handleSubmit(e) {
    e.preventDefault();
    var myHeaders = new Headers();
    myHeaders.append("project_id", "ipfsgzYParmaY6xzZCz7gGEu9q1jgjPZYtH0");
    myHeaders.append("Content-Type", "multipart/form-data");
    myHeaders.append("Content-Length", `${this.state.imagePreviewUrl}`);

    var formdata = new FormData();
    formdata.append(
      "",
      this.state.file,
      "Screenshot from 2022-04-12 05-12-04.png"
    );

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch("https://ipfs.blockfrost.io/api/v0/ipfs/add", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
  }

  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = async () => {
      // const formData = new FormData();
      // console.log(reader.result);
      // formData.append("file", Buffer.from(reader.result));
      // const res = await addIpfs(formData);
      // TODO: do something with -> this.state.file
      this.setState({
        file: file,
        imagePreviewUrl: reader.result,
      });
    };

    reader.readAsDataURL(file);
  }

  render() {
    let { imagePreviewUrl } = this.state;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = <img src={imagePreviewUrl} />;
    } else {
      $imagePreview = (
        <div className="previewText">Please select an Image for Preview</div>
      );
    }

    return (
      <div className="previewComponent">
        <form onSubmit={(e) => this._handleSubmit(e)}>
          <input
            className="fileInput"
            type="file"
            onChange={(e) => this._handleImageChange(e)}
          />
          <button
            className="submitButton"
            type="submit"
            onClick={(e) => this._handleSubmit(e)}
          >
            Upload Image
          </button>
        </form>
        <div className="imgPreview">{$imagePreview}</div>
      </div>
    );
  }
}

export default ImageUpload;
