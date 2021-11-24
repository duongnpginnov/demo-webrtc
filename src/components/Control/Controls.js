import { useEffect, useState } from "react";
import { Grid, Button } from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";

import { Modal, Avatar, Image } from "antd";
import Logo from "./../../image/logo.svg";

export default function Controls(props) {
  const {
    goToBack,
    toggleCameraAudio,
    userVideoAudio,
    clickScreenSharing,
    screenShare,
    currentUser,
    changeResolution,
  } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const turnOnMic = async () => {};

  const turnOffMic = async () => {};

  const handleChangeResolution = () => {
    let type = Math.floor(Math.random() * 3) + 1;
    changeResolution(type);
  };

  return (
    <>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Button
            variant="contained"
            color={userVideoAudio.audio ? "primary" : "secondary"}
            onClick={() => toggleCameraAudio("audio")}
          >
            {userVideoAudio.audio ? <MicIcon /> : <MicOffIcon />}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color={userVideoAudio.video ? "primary" : "secondary"}
            onClick={() => toggleCameraAudio("video")}
          >
            {userVideoAudio.video ? <VideocamIcon /> : <VideocamOffIcon />}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={clickScreenSharing}
            disabled={screenShare}
          >
            <ScreenShareIcon />
          </Button>
        </Grid>
        {currentUser == "host" ? (
          <>
            <Grid item>
              <Button variant="contained" color="primary" onClick={turnOffMic}>
                Mute All
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" onClick={turnOnMic}>
                Unmute All
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleChangeResolution}
              >
                change Resolution
              </Button>
            </Grid>
          </>
        ) : null}
        <Grid item>
          <Button variant="contained" color="default" onClick={goToBack}>
            Leave
            <ExitToAppIcon />
          </Button>
        </Grid>
        <Grid item className="control-logo">
          <Image src={Logo} preview={false} />
        </Grid>
      </Grid>
      <Modal
        title="Add Survey"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        maskClosable={false}
        footer={[
          <Button
            variant="outlined"
            onClick={handleCancel}
            style={{ marginRight: "10px" }}
          >
            Cancel
          </Button>,
          <Button variant="contained" color="primary" onClick={handleOk}>
            Start
          </Button>,
        ]}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
  );
}
