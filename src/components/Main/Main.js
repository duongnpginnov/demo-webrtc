import React, { useRef, useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Layout,
  Avatar,
  Row,
  Col,
  Image,
  message,
} from "antd";
import socket from "../../socket";

import "../../App.css";

const Main = (props) => {
  const roomRef = useRef();
  const userRef = useRef();

  useEffect(() => {
    socket.on("FE-error-user-exist", ({ error }) => {
      console.log("FE FE FE-error-user-exist ", error);
      if (!error) {
        const roomName = roomRef.current.value;
        const userName = userRef.current.value;

        sessionStorage.setItem("user", userName);
        props.history.push(`/room/${roomName}`);
      } else {
        message.warning("User name already exist");
      }
    });
  }, [props.history]);

  function clickJoin() {
    const roomName = roomRef.current.value;
    const userName = userRef.current.value;

    if (!roomName || !userName) {
      message.warning("Enter Room Name or User Name");
    } else {
      socket.emit("BE-check-user", { roomId: roomName, userName });
    }
  }

  return (
    <div className="main">
      <div className="login-form">
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
        >
          <Form.Item
            label="Room name"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input type="text" id="roomName" ref={roomRef} />
          </Form.Item>

          <Form.Item
            label="User Name"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input type="text" id="userName" ref={userRef} />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" onClick={clickJoin}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Main;
