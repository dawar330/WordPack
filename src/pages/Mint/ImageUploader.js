import React from "react";

var { create } = require("ipfs-http-client");

class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { file: "", imagePreviewUrl: "" };
  }

  async _handleSubmit(e) {
    e.preventDefault();
  }

  async _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = async () => {
      // TODO: do something with -> this.state.file
      this.setState({
        file: file,
        imagePreviewUrl: reader.result,
      });
    };

    reader.readAsDataURL(file);
    try {
      const client = create("https://ipfs.infura.io:5001/api/v0");
      const created = await client.add(file);
      let ipfs_url = `https://ipfs.infura.io/ipfs/${created.path}`;
      this.props.setIPFS(ipfs_url.slice(28));
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    var { state } = this.state;
    let $imagePreview = null;

    return (
      <div className="previewComponent">
        <form onSubmit={(e) => this._handleSubmit(e)}>
        <label htmlFor="file" className="br_dropzone">
<input
            className="fileInput"
            type="file"
            id="file" name="file"
            onChange={(e) => this._handleImageChange(e)}
          />
    <input type="text" id="fileName" name="fileName" placeholder={this.state.file ? this.state.file.name : 'Drop files to upload (or click)'} readOnly/>
  </label>
        </form>
        <div className="imgPreview">{$imagePreview}</div>
      </div>
    );
  }
}

export default ImageUpload;
