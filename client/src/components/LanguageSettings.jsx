
import { useState } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const LanguageSettings = () => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;

    setLanguage(selectedLanguage);
    localStorage.setItem("medimindLanguage", selectedLanguage);

    window.dispatchEvent(new Event("medimind-language-change"));
  };

  return (
    <Container
  fluid
  className="dashboard-page"
  dir={language === "ar" ? "rtl" : "ltr"}
>
      <Header />

      <Row style={{ minHeight: "85vh" }}>
       <Col
  md="2"
  className="settings-sidebar"
  style={{ backgroundColor: "#17418C" }}
>
  <SettingsSidebar />
</Col>

        <Col
  md="9"
  className="p-5"
  style={{
    textAlign: language === "ar" ? "right" : "left",
  }}
>
          <h2>{language === "ar" ? "اللغة" : "Language"}</h2>

          <Card>
            <CardBody>
              <select
                className="form-control"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LanguageSettings;
