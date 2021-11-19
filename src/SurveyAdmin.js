import { useEffect, useState } from "react";

import { Modal, Radio, Input, Space } from "antd";

export default function Survey(props) {
  const { users, userIndex } = props;
  const [selectValue, setSelectValue] = useState([]);

  useEffect(() => {
    let changeValue = setInterval(() => {
      let tmpData = [];
      users.length &&
        users.map((user, index) => {
          tmpData[index] = Math.floor(Math.random() * 4) + 1;
        });
      setSelectValue(tmpData);
    }, 5000);

    return () => {
      clearInterval(changeValue);
    };
  }, []);

  return (
    <div>
      <p
        style={{
          textAlign: "center",
          color: "black",
          margin: "auto",
          fontSize: "14px",
          marginTop: "10px",
        }}
      >
        What is number missing from this sequence?
      </p>
      <p
        style={{
          textAlign: "center",
          color: "black",
          margin: "auto",
          fontSize: "14px",
          marginBottom: "-15px",
        }}
      >
        4 9 16 25 36 ? 64
      </p>
      <Radio.Group value={selectValue[userIndex]}>
        <Space direction="vertical">
          <Radio value={1}>5</Radio>
          <Radio value={2}>6</Radio>
          <Radio value={3}>7</Radio>
          <Radio value={4}>
            Other...
            {selectValue[userIndex] === 4 ? (
              <Input
                style={{ width: 100, marginLeft: 10 }}
                value={Math.floor(Math.random() * 4) + 8}
              />
            ) : null}
          </Radio>
        </Space>
      </Radio.Group>
    </div>
  );
}
