import { useState, useEffect } from "react";
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
import Room from "./components/Room/Room.js";
import socket from "./socket";

function App() {
  const [inCall, setInCall] = useState(false);
  const [userName, setUserName] = useState("");
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    socket.on("user-exist", ({ error }) => {
      if (!error) {
        setInCall(true);
      } else {
        message.warning("User name already exist");
      }
    });
  }, []);

  const onFinish = (values) => {
    const channelName = values.channelName;
    const userName = values.userName;

    setChannelName(channelName);
    setUserName(userName);
    socket.emit("check-user-exist", { roomId: channelName, userName });
  };

  return (
    <div className="App" style={{ height: "100%" }}>
      {!inCall ? (
        <div className="login-form">
          <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Channel Name"
              name="channelName"
              rules={[
                { required: true, message: "Please input your Channel Name!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="User Name"
              name="userName"
              rules={[
                { required: true, message: "Please input your User Name!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Join
              </Button>
            </Form.Item>
          </Form>
        </div>
      ) : (
        <Room
          setInCall={setInCall}
          currentUser={userName}
          channelName={channelName}
        />
      )}
    </div>
  );
}

export default App;
