import { useEffect, useState } from "react";

import { Modal, Radio, Input, Space, Col, Row, Button, Image } from "antd";
import QuestionResult from "./image/question-result.PNG";
import AttendanceResult from "./image/attended-result.PNG";
import StudentResult from "./image/student-result.png";

export default function ResultAdmin(props) {
  const { setInCall, setStart, setShowResultAdmin, uuid } = props;

  useEffect(() => {}, []);

  const handleClose = () => {
    setStart(false);
    setInCall(false);
    setShowResultAdmin(false);
  };

  return (
    <div className="result-admin">
      <Row justify="space-around" className="result-admin-chart">
        {uuid == "host" ? (
          <>
            <Col span={10}>
              <Image src={AttendanceResult} preview={false} />
              <div className="result-admin-chart-title">Attendance</div>
            </Col>
            <Col span={10}>
              <Image src={QuestionResult} preview={false} />
              <div className="result-admin-chart-title">Quiz Result</div>
            </Col>
          </>
        ) : (
          <Col span={20}>
            <Image src={StudentResult} preview={false} />
            <div className="result-admin-chart-title">Your result</div>
          </Col>
        )}
      </Row>
      <Button onClick={handleClose}>Close</Button>
    </div>
  );
}
