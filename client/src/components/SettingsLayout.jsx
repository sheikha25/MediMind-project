
import { Container } from "reactstrap";
import Header from "./Header";
import SettingsSidebar from "./SettingsSidebar";

const SettingsLayout = ({ children }) => {
  return (
    <Container fluid className="dashboard-page mm-settings-page">
      <style>{`
        .mm-settings-page {
          width: 100%;
          min-width: 0;
          padding-left: 0 !important;
          padding-right: 0 !important;
          overflow-x: clip;
        }

        .mm-settings-page .mm-settings-layout {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 30px;
          align-items: start;
          min-height: 85vh;
          padding: 0 18px 32px;
          box-sizing: border-box;
        }

        .mm-settings-page .mm-settings-sidebar-column {
          width: 260px;
          min-width: 0;
        }

        .mm-settings-page .mm-settings-content {
          min-width: 0;
          width: 100%;
          padding: 40px 20px;
          box-sizing: border-box;
        }

        .mm-settings-page .mm-settings-content > * {
          max-width: 100%;
        }

        .mm-settings-page .mm-settings-content img,
        .mm-settings-page .mm-settings-content table {
          max-width: 100%;
        }

        @media (max-width: 991px) {
          .mm-settings-page .mm-settings-layout {
            grid-template-columns: minmax(0, 1fr);
            gap: 20px;
            padding: 0 12px 24px;
          }

          .mm-settings-page .mm-settings-sidebar-column {
            width: 100%;
          }

          .mm-settings-page .mm-settings-content {
            padding: 20px 8px;
          }
        }
      `}</style>

      <Header />

      <div className="mm-settings-layout">
        <div className="mm-settings-sidebar-column">
          <SettingsSidebar />
        </div>

        <main className="mm-settings-content">
          {children}
        </main>
      </div>
    </Container>
  );
};

export default SettingsLayout;
