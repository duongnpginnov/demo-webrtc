import React, { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";
import socket from "../../socket";
import VideoCard from "../Video/VideoCard";
import Controls from "../Control/Controls";
import { Row, Col } from "antd";
import ResultAdmin from "../../ResultAdmin";

var recordedChunks = [];

const Room = (props) => {
  const { currentUser, channelName, setIncall } = props;
  const [peers, setPeers] = useState([]);
  const [userVideoAudio, setUserVideoAudio] = useState({
    localUser: { video: true, audio: true },
  });
  const [videoDevices, setVideoDevices] = useState([]);
  const [screenShare, setScreenShare] = useState(false);
  const [showResultAdmin, setShowResultAdmin] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordPause, setRecordPause] = useState(false);
  const peersRef = useRef([]);
  const userVideoRef = useRef();
  const screenTrackRef = useRef();
  const userStream = useRef();
  const roomId = channelName;

  useEffect(() => {
    // Get Video Devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const filtered = devices.filter((device) => device.kind === "videoinput");
      setVideoDevices(filtered);
    });

    // Connect Camera & Mic
    let constrains = {
      video: { height: 720, width: 1080 },
      audio: true,
    };
    navigator.mediaDevices.getUserMedia(constrains).then((stream) => {
      userVideoRef.current.srcObject = stream;
      userStream.current = stream;
      window.stream = stream;

      socket.emit("join-room", { roomId, userName: currentUser });
      socket.on("list-user-join", (users) => {
        console.log("list users ", users);
        // all users
        // const peers = [];
        users.forEach(({ userId, info }) => {
          let { userName, video, audio } = info;

          if (userName !== currentUser) {
            let checkPeerExist = false;
            peersRef.current.length &&
              peersRef.current.map((peer) => {
                if (peer.peerID === userId) {
                  checkPeerExist = true;
                }
              });
            if (!checkPeerExist) {
              const peer = createPeer(userId, socket.id, stream);

              peer.userName = userName;
              peer.peerID = userId;

              peersRef.current.push({
                peerID: userId,
                peer,
                userName,
              });
              // peers.push(peer);
              setPeers((prvPeers) => {
                return [...prvPeers, peer];
              });

              setUserVideoAudio((preList) => {
                return {
                  ...preList,
                  [peer.userName]: { video, audio },
                };
              });
            }
          }
        });
      });

      socket.on("receive-call", ({ signal, from, info }) => {
        let { userName, video, audio } = info;
        const peerIdx = findPeer(from);

        if (!peerIdx) {
          const peer = addPeer(signal, from, stream);

          peer.userName = userName;
          peer.peerID = from;

          peersRef.current.push({
            peerID: from,
            peer,
            userName: userName,
          });
          setPeers((prvPeers) => {
            return [...prvPeers, peer];
          });
          setUserVideoAudio((preList) => {
            return {
              ...preList,
              [peer.userName]: { video, audio },
            };
          });
        }
      });

      socket.on("receive-accepted", ({ signal, answerId }) => {
        const peerIdx = findPeer(answerId);
        peerIdx.peer.signal(signal);
      });

      socket.on("receive-user-leave", ({ userId, userName }) => {
        const peerIdx = findPeer(userId);
        peerIdx.peer.destroy();
        setPeers((prvPeers) => {
          let tmpPeers = prvPeers.filter((peer) => peer.peerID !== userId);
          return [...tmpPeers];
        });
      });
    });

    socket.on("receive-toggle-camera-audio", ({ userId, switchTarget }) => {
      const peerIdx = findPeer(userId);

      setUserVideoAudio((preList) => {
        let video = preList[peerIdx.userName].video;
        let audio = preList[peerIdx.userName].audio;

        if (switchTarget === "video") video = !video;
        else audio = !audio;

        return {
          ...preList,
          [peerIdx.userName]: { video, audio },
        };
      });
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  function createPeer(userId, caller, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          {
            urls: ["stun:157.245.241.253"],
          },
          {
            username: "guest",
            credential: "somepassword",
            urls: ["turn:157.245.241.253"],
          },
        ],
      },
    });

    peer.on("signal", (signal) => {
      console.log("createPeer signal ", signal);
      socket.emit("call-user", {
        userToCall: userId,
        from: caller,
        signal,
      });
    });
    peer.on("disconnect", () => {
      peer.destroy();
    });

    return peer;
  }

  function changeResolution(type) {
    console.log("changeResolution type ", type);
    let constraints = {
      video: { height: 240, width: 320 },
      audio: true,
    };
    // type === 1
    //   ? {
    //       video: { height: 240, width: 320 },
    //       audio: true,
    //     }
    //   : type === 2
    //   ? {
    //       video: { height: 480, width: 640 },
    //       audio: true,
    //     }
    //   : {
    //       video: { height: 720, width: 1080 },
    //       audio: true,
    //     };

    userVideoRef.current.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      let infofo = stream.getVideoTracks()[0].getSettings();
      console.log("infofo changeResolution ", infofo);

      //update stream of peer

      // const screenTrack = stream.getTracks()[0];

      peersRef.current.forEach(({ peer }) => {
        // replaceTrack (oldTrack, newTrack, oldStream);
        peer.replaceTrack(
          peer.streams[0].getVideoTracks()[0],
          stream.getVideoTracks()[0],
          userStream.current
        );
      });

      userVideoRef.current.srcObject = stream;
      userStream.current = stream;
    });
  }

  function recordRemote(remoteStream) {
    if (window.mediaRecorder) {
      console.log("stop old ");
      window.mediaRecorder.stop();
      var options = { mimeType: "video/webm;codecs=vp9,opus" };
      console.log("recordRemote remoteStream", remoteStream);
      window.mediaRemoteRecorder = "";
      try {
        window.mediaRemoteRecorder = new MediaRecorder(remoteStream, options);
      } catch (error) {
        console.log("startRecord error ", error);
      }
      window.mediaRemoteRecorder.ondataavailable = handleDataAvailable;
      window.mediaRemoteRecorder.start(1500);
      setRecording(true);
    }
  }

  function handlePauseResume() {
    if (recordPause) {
      console.log("resume window.mediaRecorder", window.mediaRecorder);
      console.log(
        "resume window.mediaRemoteRecorder",
        window.mediaRemoteRecorder
      );
      window.mediaRecorder &&
        window.mediaRecorder.state !== "inactive" &&
        window.mediaRecorder.resume();
      window.mediaRemoteRecorder && window.mediaRemoteRecorder.resume();
      setRecordPause(false);
    } else {
      console.log("pause window.mediaRecorder", window.mediaRecorder);
      console.log(
        "pause window.mediaRemoteRecorder",
        window.mediaRemoteRecorder
      );
      window.mediaRecorder &&
        window.mediaRecorder.state !== "inactive" &&
        window.mediaRecorder.pause();
      window.mediaRemoteRecorder && window.mediaRemoteRecorder.pause();
      setRecordPause(true);
    }
  }

  function handleDataAvailable(event) {
    console.log("data-available ", event);
    if (event && event.data.size > 0) {
      recordedChunks.push(event.data);
    } else {
      console.log("data-not-available");
    }
  }

  function startRecord() {
    console.log("startRecord ", window.stream);

    var options = { mimeType: "video/webm;codecs=vp9,opus" };
    window.mediaRecorder = "";
    try {
      window.mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (error) {
      console.log("startRecord error ", error);
    }

    window.mediaRecorder.ondataavailable = handleDataAvailable;
    window.mediaRecorder.start(1500);
    setRecording(true);
  }

  function stopRecord() {
    console.log("stopRecord ", recordedChunks);
    var blob = new Blob(recordedChunks, {
      type: "video/webm",
    });

    blob.name = "video-interview";
    console.log("blob", blob);
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "video-interview.webm";
    a.click();
    window.URL.revokeObjectURL(url);
    window.mediaRecorder &&
      window.mediaRecorder.state !== "inactive" &&
      window.mediaRecorder.stop();
    window.mediaRemoteRecorder && window.mediaRemoteRecorder.stop();

    recordedChunks = [];
    setRecording(false);
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: [
          {
            urls: ["stun:157.245.241.253"],
          },
          {
            username: "guest",
            credential: "somepassword",
            urls: ["turn:157.245.241.253"],
          },
        ],
      },
    });

    peer.on("signal", (signal) => {
      console.log("addPeer signal ", signal);
      socket.emit("accepted-call", { signal, to: callerId });
    });

    peer.on("disconnect", () => {
      peer.destroy();
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function findPeer(id) {
    return peersRef.current.find((p) => p.peerID === id);
  }

  function createUserVideo(peer, index, arr) {
    return (
      <Col span={24} key={index}>
        <div className="video-user">
          {writeUserName(peer.userName)}
          <div>
            {userVideoAudio[peer.userName]?.audio ? (
              <div className="fas fa-microphone"></div>
            ) : (
              <div className="fas fa-microphone-slash"></div>
            )}
          </div>
          <div style={{ position: "absolute", top: 0, right: "35px" }}>
            {userVideoAudio[peer.userName]?.video ? (
              <div className="fas fa-video"></div>
            ) : (
              <div className="fas fa-video-slash"></div>
            )}
          </div>
          <VideoCard
            key={index}
            peer={peer}
            number={arr.length}
            recordRemote={recordRemote}
          />
        </div>
      </Col>
    );
  }

  function writeUserName(userName, index) {
    if (userVideoAudio.hasOwnProperty(userName)) {
      // if (!userVideoAudio[userName].video) {
      return (
        <div className="video-user-name" key={userName}>
          {userName}
        </div>
      );
      // }
    }
  }

  // BackButton
  const goToBack = () => {
    // setShowResultAdmin(true);
    socket.emit("call-user-leave", { roomId, leaver: currentUser });
    window.location.href = "/";
  };

  const toggleCameraAudio = (type) => {
    setUserVideoAudio((preList) => {
      let videoSwitch = preList["localUser"].video;
      let audioSwitch = preList["localUser"].audio;

      if (type === "video") {
        const userVideoTrack =
          userVideoRef.current.srcObject.getVideoTracks()[0];
        videoSwitch = !videoSwitch;
        userVideoTrack.enabled = videoSwitch;
      } else {
        const userAudioTrack =
          userVideoRef.current.srcObject.getAudioTracks()[0];
        audioSwitch = !audioSwitch;

        if (userAudioTrack) {
          userAudioTrack.enabled = audioSwitch;
        } else {
          userStream.current.getAudioTracks()[0].enabled = audioSwitch;
        }
      }

      return {
        ...preList,
        localUser: { video: videoSwitch, audio: audioSwitch },
      };
    });

    socket.emit("call-toggle-camera-audio", { roomId, switchTarget: type });
  };

  const clickScreenSharing = () => {
    if (!screenShare) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          const screenTrack = stream.getTracks()[0];

          peersRef.current.forEach(({ peer }) => {
            // replaceTrack (oldTrack, newTrack, oldStream);
            peer.replaceTrack(
              peer.streams[0]
                .getTracks()
                .find((track) => track.kind === "video"),
              screenTrack,
              userStream.current
            );
          });

          // Listen click end
          screenTrack.onended = () => {
            peersRef.current.forEach(({ peer }) => {
              peer.replaceTrack(
                screenTrack,
                peer.streams[0]
                  .getTracks()
                  .find((track) => track.kind === "video"),
                userStream.current
              );
            });
            userVideoRef.current.srcObject = userStream.current;
            setScreenShare(false);
          };

          userVideoRef.current.srcObject = stream;
          screenTrackRef.current = screenTrack;
          setScreenShare(true);
        });
    } else {
      screenTrackRef.current.onended();
    }
  };

  console.log("peers ", peers);
  return (
    <>
      {showResultAdmin ? (
        <ResultAdmin currentUser={currentUser} roomId={roomId} />
      ) : (
        <div className="video-container">
          <div className="video-main">
            <div className="video-option">
              <Controls
                clickScreenSharing={clickScreenSharing}
                goToBack={goToBack}
                toggleCameraAudio={toggleCameraAudio}
                userVideoAudio={userVideoAudio["localUser"]}
                screenShare={screenShare}
                currentUser={currentUser}
                changeResolution={changeResolution}
                startRecord={startRecord}
                stopRecord={stopRecord}
                recording={recording}
                handlePauseResume={handlePauseResume}
                recordPause={recordPause}
              />
            </div>
            <div className="video-channel-name">{channelName}</div>
            <div className="video-list">
              <Row>
                <Col span={24}>
                  {/* Current User Video */}
                  <div className="video-user">
                    <video
                      ref={userVideoRef}
                      muted
                      autoPlay
                      playsInline
                    ></video>
                  </div>
                </Col>
                {/* Joined User Vidoe */}
                {peers &&
                  peers.map((peer, index, arr) =>
                    createUserVideo(peer, index, arr)
                  )}
              </Row>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Room;
