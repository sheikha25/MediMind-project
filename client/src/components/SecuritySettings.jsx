
import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SecuritySettings = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [language, setLanguage] = useState(
    () =>
      localStorage.getItem("medimindLanguage") === "ar"
        ? "ar"
        : "en"
  );

  const isArabic = language === "ar";
  const t = (en, ar) => (isArabic ? ar : en);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(
        localStorage.getItem("medimindLanguage") === "ar"
          ? "ar"
          : "en"
      );
    };

    window.addEventListener(
      "medimind-language-change",
      syncLanguage
    );
    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener(
        "medimind-language-change",
        syncLanguage
      );
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);
  const [deletePassword, setDeletePassword] =
    useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");

  const closeDeleteModal = () => {
    if (isDeleting) return;

    setDeleteModalOpen(false);
    setDeletePassword("");
    setDeleteError("");
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim() || isDeleting) return;

    if (!user?.email) {
      setDeleteError(
        t(
          "Please log in again.",
          "يرجى تسجيل الدخول مجددًا."
        )
      );
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      const response = await axios.post(
        "http://localhost:3002/account/deletion-request",
        {
          email: user.email,
          password: deletePassword,
        }
      );

      if (response.data.success) {
        setDeletePassword("");
        setDeleteModalOpen(false);

        alert(
          t(
            "Your account deletion request has been submitted successfully. It is now pending administrator review.",
            "تم إرسال طلب حذف حسابك بنجاح، وهو الآن بانتظار مراجعة المسؤول."
          )
        );

        dispatch({ type: "user/logout" });
        navigate("/", { replace: true });
      } else {
        setDeleteError(
          t(
            "Unable to submit your deletion request. Please try again.",
            "تعذر إرسال طلب حذف الحساب. يرجى المحاولة مجددًا."
          )
        );
      }
    } catch (error) {
      console.error(
        "Account deletion request error:",
        error
      );

      setDeleteError(
        isArabic
          ? "تعذر إرسال طلب حذف الحساب. يرجى التحقق من كلمة المرور والمحاولة مجددًا."
          : error.response?.data?.message ||
              "Unable to submit your deletion request. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const modalStyle = {
    backgroundColor: "#1b2d42",
    color: "#f1f5f9",
    border: "1px solid #40566f",
    borderRadius: "16px",
  };

  const modalInputStyle = {
    backgroundColor: "#263b52",
    color: "#ffffff",
    border: "1px solid #536b85",
    borderRadius: "9px",
    fontSize: "17px",
    padding: "12px",
  };

  return (
    <div
      className="security-settings-page"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .security-settings-page {
          --security-card: #ffffff;
          --security-text: #1e293b;
          --security-muted: #64748b;
          --security-input: #ffffff;
          --security-border: #dbe4ef;

          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        body.dark-mode .security-settings-page,
        body.dark-theme .security-settings-page,
        [data-theme="dark"] .security-settings-page,
        .dark-mode .security-settings-page,
        .dark-theme .security-settings-page {
          --security-card: #17283a;
          --security-text: #f1f5f9;
          --security-muted: #c4cfdd;
          --security-input: #22384f;
          --security-border: #415a73;
        }

        .security-settings-page .security-title {
          color: var(--security-text);
          font-size: 30px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .security-settings-page .security-card {
          background: var(--security-card);
          color: var(--security-text);
          border: 1px solid var(--security-border);
          border-radius: 14px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .security-settings-page .security-label {
          color: var(--security-text);
        }

        .security-settings-page .security-muted {
          color: var(--security-muted) !important;
        }

        .security-settings-page .security-input {
          background: var(--security-input);
          color: var(--security-text);
          border: 1px solid var(--security-border);
          min-height: 44px;
        }

        .security-settings-page .security-input::placeholder {
          color: var(--security-muted);
          opacity: 1;
        }

        .security-settings-page .security-danger-card {
          border-color: #dc3545;
        }

        .security-settings-page {
          text-align: start;
        }

        .security-delete-modal {
          background: #1b2d42 !important;
          border: none !important;
          border-radius: 16px !important;
          overflow: hidden;
        }

        .security-delete-modal .modal-header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          border-color: #40566f;
        }

        .security-delete-modal .modal-header .btn-close {
          margin: 0 !important;
          padding: 0 !important;
          order: 2;
        }

        .security-delete-modal .modal-header .modal-title {
          order: 1;
        }

        .security-delete-modal .btn-close {
          filter: invert(1) grayscale(100%) brightness(200%);
          opacity: 1;
        }

        .security-delete-modal .btn-close:hover {
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .security-settings-page .security-title {
            font-size: 25px;
          }
        }
      `}</style>

      <h2 className="security-title">
        {t("Security", "الأمان")}
      </h2>

      <Card className="security-card">
        <CardBody>
          <h5 className="security-label mb-3">
            {t("Change Password", "تغيير كلمة المرور")}
          </h5>

          <input
            type="password"
            className="form-control security-input mb-3"
            placeholder={t(
              "Current Password",
              "كلمة المرور الحالية"
            )}
            aria-label={t(
              "Current Password",
              "كلمة المرور الحالية"
            )}
          />

          <input
            type="password"
            className="form-control security-input mb-3"
            placeholder={t(
              "New Password",
              "كلمة المرور الجديدة"
            )}
            aria-label={t(
              "New Password",
              "كلمة المرور الجديدة"
            )}
          />

          <Button
            color="primary"
            className="w-100"
            onClick={() =>
              setNotice(
                t(
                  "Password changing is not connected yet. No changes were made.",
                  "تغيير كلمة المرور غير مربوط بالنظام بعد. لم يتم إجراء أي تغيير."
                )
              )
            }
          >
            {t("Change Password", "تغيير كلمة المرور")}
          </Button>

          {notice && (
            <div
              className="alert alert-warning mt-3"
              role="status"
            >
              {notice}
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="security-card security-danger-card mt-4">
        <CardBody>
          <h5
            className="text-danger"
            style={{
              fontSize: "24px",
              fontWeight: "700",
            }}
          >
            {t("Delete Account", "حذف الحساب")}
          </h5>

          <p
            className="security-muted"
            style={{
              fontSize: "18px",
              lineHeight: "1.9",
            }}
          >
            {t(
              "Request permanent deletion of your account and associated data. Your request will be reviewed by the administrator before any data is deleted.",
              "يمكنك طلب حذف حسابك والبيانات المرتبطة به نهائيًا. سيراجع المسؤول طلبك قبل حذف أي بيانات."
            )}
          </p>

          <Button
            color="danger"
            style={{
              fontSize: "17px",
              fontWeight: "600",
              padding: "12px 24px",
            }}
            onClick={() => {
              setDeleteError("");
              setDeleteModalOpen(true);
            }}
          >
            {t("Delete My Account", "حذف حسابي")}
          </Button>
        </CardBody>
      </Card>

      <Modal
        isOpen={deleteModalOpen}
        toggle={closeDeleteModal}
        centered
        contentClassName="security-delete-modal"
      >
        <div
          style={{
            ...modalStyle,
            direction: isArabic ? "rtl" : "ltr",
            textAlign: isArabic ? "right" : "left",
            overflow: "hidden",
          }}
        >
          <ModalHeader
            toggle={closeDeleteModal}
            style={{
              borderBottom: "1px solid #40566f",
              color: "#ffffff",
              fontSize: "22px",
            }}
          >
            {t(
              "Confirm Account Deletion",
              "تأكيد طلب حذف الحساب"
            )}
          </ModalHeader>

          <ModalBody style={{ padding: "24px" }}>
            <p
              style={{
                color: "#ff7b88",
                fontSize: "18px",
                fontWeight: "700",
                lineHeight: "1.8",
              }}
            >
              {t(
                "Are you sure you want to request account deletion?",
                "هل أنت متأكد من رغبتك في طلب حذف الحساب؟"
              )}
            </p>

            <p
              style={{
                color: "#e2e8f0",
                fontSize: "17px",
                lineHeight: "1.9",
              }}
            >
              {t(
                "Your request will be sent to the administrator for review. Your account and associated data will not be deleted until the request is approved.",
                "سيُرسل طلبك إلى المسؤول للمراجعة. لن يُحذف حسابك أو بياناتك المرتبطة به إلا بعد الموافقة على الطلب."
              )}
            </p>

            <label
              className="mb-2"
              style={{
                color: "#ffffff",
                fontSize: "17px",
                fontWeight: "600",
              }}
            >
              {t(
                "Enter your password to confirm:",
                "أدخل كلمة المرور للتأكيد:"
              )}
            </label>

            <input
              type="password"
              className="form-control"
              placeholder={t(
                "Current password",
                "كلمة المرور الحالية"
              )}
              value={deletePassword}
              onChange={(e) =>
                setDeletePassword(e.target.value)
              }
              style={modalInputStyle}
            />

            {deleteError && (
              <p
                className="mt-3"
                style={{
                  color: "#ff8b94",
                  fontSize: "16px",
                }}
                role="alert"
              >
                {deleteError}
              </p>
            )}
          </ModalBody>

          <ModalFooter
            style={{
              borderTop: "1px solid #40566f",
              display: "flex",
              justifyContent: "flex-start",
              gap: "10px",
              padding: "18px 24px",
            }}
          >
            <Button
              color="secondary"
              outline
              onClick={closeDeleteModal}
              style={{
                fontSize: "16px",
                padding: "10px 18px",
              }}
            >
              {t("Cancel", "إلغاء")}
            </Button>

            <Button
              color="danger"
              onClick={handleDeleteAccount}
              disabled={
                !deletePassword.trim() || isDeleting
              }
              style={{
                fontSize: "16px",
                padding: "10px 18px",
              }}
            >
              {isDeleting
                ? t("Submitting...", "جارٍ الإرسال...")
                : t(
                    "Submit Deletion Request",
                    "إرسال طلب الحذف"
                  )}
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
};

export default SecuritySettings;
