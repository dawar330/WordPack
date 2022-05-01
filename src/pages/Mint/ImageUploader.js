import React from "react";
import "../Home/style.scss";
class ImageUploaderThumbnails extends React.Component {
  render() {
    let Input = this.props.input || null;
    return (
      <div className="image-thumbnails">
        <div className="image-thumbnail image-upload-button-container">
          <Input />
          <span>+</span>
        </div>
        {this.props.thumbnails.map((thumbnail, index) => (
          <div
            className={
              "image-thumbnail" +
              (index === this.props.current ? " image-thumbnail-selected" : "")
            }
            style={{ "background-image": `url(${thumbnail})` }}
            onClick={(e) => {
              this.props.onSelect && this.props.onSelect(index);
            }}
          />
        ))}
      </div>
    );
  }
}

class ImageUploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      previewIndex: 0,
      showDropArea: false,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.showDropArea = this.showDropArea.bind(this);
    this.hideDropArea = this.hideDropArea.bind(this);
    this.showNextImage = this.showNextImage.bind(this);
    this.showPreviousImage = this.showPreviousImage.bind(this);
    this.removeCurrentImage = this.removeCurrentImage.bind(this);
  }
  readFileData(file) {
    const promise = new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject("Something went wrong when reading the file");
      };
      reader.readAsDataURL(file);
    });
    return promise;
  }
  selectImageForPreview(previewIndex, relative) {
    if (relative) {
      this.setState((prevState) => {
        let newState = Object.assign({}, prevState);
        let imageCount = this.state.files.length;
        newState.previewIndex =
          (prevState.previewIndex + previewIndex + imageCount) % imageCount;
        return newState;
      });
    } else {
      this.setState({ previewIndex });
    }
  }
  showNextImage() {
    this.selectImageForPreview(1, true);
  }
  showPreviousImage() {
    this.selectImageForPreview(-1, true);
  }
  removeCurrentImage(e) {
    e && e.preventDefault();
    let indexToRemove = this.state.previewIndex;
    this.setState((prevState) => {
      let nextState = Object.assign({}, prevState);
      nextState.files = prevState.files.filter(
        (_, index) => index !== indexToRemove
      );
      nextState.previewIndex = Math.max(
        Math.min(nextState.files.length - 1, prevState.previewIndex),
        0
      );
      return nextState;
    });
  }
  handleInputChange(e) {
    e && e.stopPropagation();
    let files = e.target.files;
    let fileReadProcesses = Array.prototype.map.call(files, (file) =>
      this.readFileData(file)
    );
    Promise.all(fileReadProcesses).then((thumbnails) => {
      let filesData = thumbnails.map((thumbnail, index) => ({
        file: files[index],
        thumbnail,
      }));
      this.setState((prevState) => {
        let newState = Object.assign({}, prevState);
        newState.files = prevState.files.concat(filesData);
        return newState;
      });
    });
  }
  showDropArea(e) {
    e && e.preventDefault();
    this.setState({ showDropArea: true });
  }
  hideDropArea(e) {
    e && e.preventDefault();
    this.setState({ showDropArea: false });
  }
  render() {
    console.warn(this.state);
    let Input = () => (
      <input
        type="file"
        accept="image/png, image/jpg, image/jpeg"
        multiple={false}
        onChange={this.handleInputChange}
        className="image-upload-button"
      />
    );
    let { previewIndex } = this.state;
    let previewImage = this.state.files.length
      ? this.state.files[previewIndex].thumbnail
      : "";
    return (
      <div className="image-uploader">
        <div className="image-uploader-container">
          {!this.state.files.length || this.state.showDropArea ? (
            <div className="image-upload-button-container image-upload-button-view-full">
              <Input />
              Click here or drag images here to upload
            </div>
          ) : (
            [
              <div
                key="1"
                className="image-upload-preview"
                style={{ "background-image": `url(${previewImage})` }}
              >
                {this.props.multiple ? (
                  <div className="image-preview-index">
                    {previewIndex + 1} &#x2f; {this.state.files.length}
                  </div>
                ) : null}
                {this.props.multiple && this.state.files.length && (
                  <div className="image-navigation-buttons">
                    <button
                      className="image-navigation-button"
                      onClick={this.showPreviousImage}
                    >
                      &#10092;
                    </button>
                    <button
                      className="image-navigation-button"
                      onClick={this.showNextImage}
                    >
                      &#10093;
                    </button>
                  </div>
                )}
              </div>,
              <div className="image-action-buttons" key="2">
                <button className="image-action-button">View</button>
                <button
                  className="image-action-button"
                  onClick={this.removeCurrentImage}
                >
                  Delete
                </button>
              </div>,
            ]
          )}
        </div>
        {this.props.multiple && this.state.files.length ? (
          <ImageUploaderThumbnails
            thumbnails={this.state.files.map((image) => image.thumbnail)}
            current={previewIndex}
            onSelect={(index) => {
              this.selectImageForPreview(index);
            }}
            input={Input}
          />
        ) : null}
      </div>
    );
  }
}
export default ImageUploader;
