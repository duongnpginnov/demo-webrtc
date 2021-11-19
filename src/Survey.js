import { useEffect, useState } from "react";

import { Modal, Radio, Input, Space } from "antd";

export default function Survey(props) {
  const { isModalVisible, handleOk, handleCancel } = props;
  const [timwShowSurvey, setTimeShowSurvey] = useState(10);
  const [selectValue, setSelectValue] = useState(1);

  useEffect(() => {
    let timeToEnd = 30;
    let timeShowInterview = setInterval(() => {
      timeToEnd -= 1;
      setTimeShowSurvey(timeToEnd);
    }, 1000);
    let timeshowTimeout = setTimeout(() => {
      console.log("close modal");
      clearInterval(timeShowInterview);
      handleOk();
    }, 29800);
    return () => {
      clearTimeout(timeshowTimeout);
      clearInterval(timeShowInterview);
    };
  }, []);

  const onChange = (e) => {
    setSelectValue(e.target.value);
  };

  return (
    <Modal
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      maskClosable={false}
    >
      <h2 style={{ textAlign: "center" }}>
        Your survey will be close after {timwShowSurvey} seconds
      </h2>
      <p style={{ textAlign: "center" }}>
        What is number missing from this sequence?
      </p>
      <p style={{ textAlign: "center" }}>4 9 16 25 36 ? 64</p>
      <Radio.Group onChange={onChange} value={selectValue}>
        <Space direction="vertical">
          <Radio value={1}>5</Radio>
          <Radio value={2}>6</Radio>
          <Radio value={3}>7</Radio>
          <Radio value={4}>
            Other...
            {selectValue === 4 ? (
              <Input style={{ width: 100, marginLeft: 10 }} />
            ) : null}
          </Radio>
        </Space>
      </Radio.Group>
    </Modal>
  );
}
