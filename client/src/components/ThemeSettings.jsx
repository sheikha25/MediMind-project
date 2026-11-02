import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const ThemeSettings = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem("medimind-theme") || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }

    localStorage.setItem("medimind-theme", theme);
  }, [theme]);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  return (
    <Container fluid className="dashboard-page">
      <Header />

      <Row style={{ minHeight: "85vh" }}>
        <Col
  md="2"
  className="settings-sidebar"
  style={{ backgroundColor: "#17418C" }}
>
  <SettingsSidebar />
</Col>

        <Col md="9" className="p-5">
          <h2>Theme</h2>

          <Card>
            <CardBody>
              <select
                className="form-control"
                value={theme}
                onChange={handleThemeChange}
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ThemeSettings;