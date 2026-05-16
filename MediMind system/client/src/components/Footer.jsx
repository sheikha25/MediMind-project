import { Container, Row, Col } from "reactstrap";

const Footer = () => {
  return (
    <footer className="footer mt-auto py-4">
      <hr className="footer-divider" />

      <Container>
        <Row className="text-center text-md-start justify-content-between">
          <Col md="4" className="mb-4">
            <h5 className="fw-bold mb-3">MediMind</h5>
            <p className="text-muted small">
              A smart web-based medication reminder system that helps users manage
              medication schedules, reminders, and adherence reports.
            </p>
          </Col>

          <Col md="3" className="mb-4">
            <h6 className="fw-bold mb-3">Developers</h6>
            <p className="text-muted small mb-1">Sheikha Qasim Al-Qusaimi</p>
            <p className="text-muted small">Rawan Salim Al-Hosni</p>
          </Col>

          <Col md="3" className="mb-4">
            <h6 className="fw-bold mb-3">Contact</h6>
            <p className="text-muted small mb-1">Email: support@medimind.com</p>
            <p className="text-muted small">Location: Muscat, Oman</p>
          </Col>
        </Row>

        <p className="text-center text-muted small mb-0">
          © 2026 MediMind. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;