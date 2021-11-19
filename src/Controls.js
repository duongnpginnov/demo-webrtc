import { useEffect, useState } from "react";
import { useClient, useShareScreen } from "./settings";
import { Grid, Button } from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import { config, appId } from "./settings.js";

import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { Modal, Avatar, Image } from "antd";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import db from "./configFireBase";
import Logo from "./image/logo.svg";

export default function Controls(props) {
  const client = useClient();
  const {
    tracks,
    setStart,
    setInCall,
    muteOther,
    uuid,
    users,
    userAction,
    currentUserSharing,
    channelName,
    token,
    setShowResultAdmin,
    updateUserMic,
  } = props;
  const [trackState, setTrackState] = useState({ video: true, audio: true });
  const [shareScreen, setShareScreen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalStudent, setIsModalStudent] = useState(false);

  const usersRef = doc(db, "users-test", new Date().getTime().toString());

  useEffect(() => {
    console.log("muteOther ", muteOther);
    const handleChange = async () => {
      // if (uuid == 22) {
      await tracks[0].setEnabled(muteOther ? false : true);
      setTrackState((ps) => {
        return { ...ps, audio: muteOther ? false : true };
      });
      // }
    };

    handleChange();
  }, [muteOther]);

  useEffect(() => {
    console.log("test - userAction control ", userAction);
    const handleChange = async (type, status) => {
      if (type == "mic") {
        await tracks[0].setEnabled(status);
        setTrackState((ps) => {
          return { ...ps, audio: status };
        });
      } else if (type == "cam") {
        await tracks[1].setEnabled(status);
        setTrackState((ps) => {
          return { ...ps, video: status };
        });
      }
    };
    const handleKickOut = async () => {
      await client.leave();
      client.removeAllListeners();
      tracks[0].close();
      tracks[1].close();
      // setStart(false);
      // setInCall(false);
      setShowResultAdmin(true);
    };

    if (userAction && userAction.hasOwnProperty("timestamp")) {
      if (userAction.type == "mic") {
        if (userAction.value == "all" && uuid != "host") {
          handleChange("mic", userAction.status);
        } else if (userAction.value == "one") {
          if (userAction.uid == uuid) {
            handleChange("mic", userAction.status);
          }
        }
      } else if (userAction.type == "cam") {
        if (userAction.value == "all" && uuid != "host") {
          // coming soon
        } else if (userAction.value == "one") {
          if (userAction.uid == uuid) {
            handleChange("cam", userAction.status);
          }
        }
      } else if (userAction.type == "kick") {
        if (
          (userAction.value == "one" && uuid == userAction.uid) ||
          userAction.value == "all"
        ) {
          handleKickOut();
        }
      }
    }
  }, [userAction]);

  const mute = async (type) => {
    if (type === "audio") {
      await tracks[0].setEnabled(!trackState.audio);
      setTrackState((ps) => {
        return { ...ps, audio: !ps.audio };
      });
    } else if (type === "video") {
      await tracks[1].setEnabled(!trackState.video);
      setTrackState((ps) => {
        return { ...ps, video: !ps.video };
      });
    }
  };

  const handleShareScreen = async () => {
    console.log("shareScreen ");

    const videoClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    let tmpUid = uuid + "-shareScreen-9999";
    let alo = await videoClient.join(appId, channelName, token, tmpUid);
    try {
      const videoTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: "1080p_1",
      });
      await videoClient.publish(videoTrack);
      videoTrack.on("track-ended", async (data) => {
        await videoClient.leave();
      });
    } catch (error) {
      console.log("test- error ", error);
      await videoClient.leave();
    }

    // let screenStream = AgoraRTC.createStream({
    //   streamID: uuid,
    //   audio: false,
    //   video: false,
    //   screen: true,
    // });

    // await tracks[0].setEnabled(false);
    // setTrackState((ps) => {
    //   return { ...ps, audio: false };
    // });
    // await tracks[1].setEnabled(false);
    // setTrackState((ps) => {
    //   return { ...ps, video: false };
    // });

    // let trackScreen = await AgoraRTC.createScreenVideoTrack({
    //   encoderConfig: "1080p_1",
    // });
    // if (trackScreen) {
    //   // client.publish(trackScreen);
    //   // await tracks[0].setEnabled(true);
    //   // setTrackState((ps) => {
    //   //   return { ...ps, audio: true };
    //   // });
    //   trackScreen.on("track-ended", async (data) => {
    //     client.unpublish(trackScreen);
    //     // await tracks[1].setEnabled(true);
    //     // setTrackState((ps) => {
    //     //   return { ...ps, video: true };
    //     // });
    //   });
    // }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    const updateTimestamp = await setDoc(usersRef, {
      name: channelName,
      uid: 9999999999,
      status: true,
      type: "survey", // "cam", "survey",
      timestamp: new Date().getTime(),
      value: "all",
    });
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showModalResult = () => {
    setIsModalStudent(true);
  };

  const handleStudentOk = async () => {
    setIsModalStudent(false);
  };

  const handleStudentCancel = () => {
    setIsModalStudent(false);
  };

  const leaveChannel = async () => {
    await client.leave();
    client.removeAllListeners();
    tracks[0].close();
    tracks[1].close();
    // setStart(false);
    // setInCall(false);
    setShowResultAdmin(true);
    if (uuid == "host") {
      const updateTimestamp = await setDoc(usersRef, {
        name: channelName,
        uid: 9999999999,
        status: false,
        type: "kick", // "cam", "survey",
        timestamp: new Date().getTime(),
        value: "all", // "one"
      });
    }
  };

  const turnOnMic = async () => {
    updateUserMic("all", uuid, true);
    const updateTimestamp = await setDoc(usersRef, {
      name: channelName,
      uid: 9999999999,
      status: true,
      type: "mic", // "cam", "survey",
      timestamp: new Date().getTime(),
      value: "all", // "one"
    });

    // const docRef = await setDoc(collection(db, "users-test", "sadasd"), {
    //   name: "test 8",
    //   uid: 9999999999,
    //   status: true,
    //   type: "mic", // "cam", "survey",
    //   timestamp: new Date().getTime(),
    //   value: "all", // "one"
    // });
  };

  const turnOffMic = async () => {
    updateUserMic("all", uuid, false);
    const updateTimestamp = await setDoc(usersRef, {
      name: channelName,
      uid: 9999999999,
      status: false,
      type: "mic", // "cam", "survey",
      timestamp: new Date().getTime(),
      value: "all", // "one"
    });
  };

  console.log("list users ", users);

  return (
    <>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Button
            variant="contained"
            color={trackState.audio ? "primary" : "secondary"}
            onClick={() => mute("audio")}
          >
            {trackState.audio ? <MicIcon /> : <MicOffIcon />}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color={trackState.video ? "primary" : "secondary"}
            onClick={() => mute("video")}
          >
            {trackState.video ? <VideocamIcon /> : <VideocamOffIcon />}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleShareScreen}
            disabled={
              currentUserSharing?.hasOwnProperty("uid") &&
              currentUserSharing?.videoTrack
            }
          >
            <ScreenShareIcon />
          </Button>
        </Grid>
        {uuid == "host" ? (
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
          </>
        ) : (
          <Grid item>
            <Button
              variant="contained"
              color="default"
              onClick={() => leaveChannel()}
            >
              Leave
              <ExitToAppIcon />
            </Button>
          </Grid>
        )}
        {/* <Grid item>
          <Button variant="contained" color="primary" onClick={showModalResult}>
            Result
          </Button>
        </Grid> */}
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
      <Modal
        title="Your result"
        visible={isModalStudent}
        onOk={handleStudentOk}
        onCancel={handleStudentCancel}
        maskClosable={false}
        footer={[
          <Button variant="contained" color="primary" onClick={handleStudentOk}>
            OK
          </Button>,
        ]}
      >
        <p>Some result...</p>
      </Modal>
    </>
  );
}
