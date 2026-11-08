
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardBody,
  Button,
} from "reactstrap";


const FeedbackSettings = () => {
  const user = useSelector((state) => state.user.user);

  const [language, setLanguage] = useState(
    () => localStorage.getItem("medimindLanguage") || "en"
  );

  const isArabic = language === "ar";
  const t = (en, ar) => (isArabic ? ar : en);

  // Account identity comes from the logged-in user and is not editable here.
  const name = user?.name || "";
  const email = user?.email || "";
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(
        localStorage.getItem("medimindLanguage") || "en"
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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !feedback.trim()) {
      setMessage(
        t(
          "Please complete all required fields.",
          "يرجى تعبئة جميع الحقول المطلوبة."
        )
      );
      return;
    }

    if (rating === 0) {
      setMessage(
        t(
          "Please select a rating.",
          "يرجى اختيار تقييم."
        )
      );
      return;
    }

    // Feedback submission API will be connected later.
    setMessage(
      t(
        "Feedback submission is not available yet.",
        "إرسال الملاحظات غير متاح حاليًا."
      )
    );
  };

  return (
    <div
      className="feedback-settings-page"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <style>{`
        .feedback-settings-page {
          --feedback-card: #ffffff;
          --feedback-text: #24364b;
          --feedback-muted: #64748b;
          --feedback-border: #dce6f2;
          --feedback-input: #ffffff;
          --feedback-heading: #17418c;
          width: 100%;
          min-width: 0;
        }

        body.dark-theme .feedback-settings-page,
        body.dark-mode .feedback-settings-page,
        [data-theme="dark"] .feedback-settings-page {
          --feedback-card: #192d42;
          --feedback-text: #f1f5f9;
          --feedback-muted: #c4d1df;
          --feedback-border: #40566f;
          --feedback-input: #243b53;
          --feedback-heading: #a9c9ff;
        }

        .feedback-settings-page .feedback-title {
          color: var(--feedback-heading);
          font-size: 30px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .feedback-settings-page .feedback-card {
          background: var(--feedback-card);
          color: var(--feedback-text);
          border: 1px solid var(--feedback-border);
          border-radius: 16px;
          max-width: 750px;
          width: 100%;
          padding: 14px;
        }

        .feedback-settings-page .feedback-label {
          display: block;
          color: var(--feedback-text);
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 9px;
        }

        .feedback-settings-page .feedback-input {
          background: var(--feedback-input);
          color: var(--feedback-text);
          border: 1px solid var(--feedback-border);
          border-radius: 10px;
          font-size: 17px;
          padding: 12px;
        }

        .feedback-settings-page .feedback-input:focus {
          background: var(--feedback-input);
          color: var(--feedback-text);
        }

        .feedback-settings-page .feedback-input::placeholder {
          color: var(--feedback-muted);
        }

        .feedback-settings-page .feedback-description {
          color: var(--feedback-muted);
          font-size: 17px;
          line-height: 1.8;
          margin-bottom: 22px;
        }

        .feedback-settings-page .feedback-star {
          background: transparent;
          border: none;
          font-size: 38px;
          cursor: pointer;
          padding: 0 4px;
          line-height: 1.2;
          transition: transform 0.15s ease;
        }

        .feedback-settings-page .feedback-star:hover {
          transform: scale(1.12);
        }

        .feedback-settings-page .feedback-rating-text {
          color: var(--feedback-muted);
          font-size: 16px;
          margin-top: 10px;
        }

        .feedback-settings-page .feedback-message {
          color: var(--feedback-text);
          font-size: 16px;
          padding: 12px;
          border: 1px solid var(--feedback-border);
          border-radius: 9px;
          margin-bottom: 15px;
        }

        .feedback-settings-page[dir="rtl"] {
          text-align: right;
        }

        @media (max-width: 768px) {


          .feedback-settings-page .feedback-title {
            font-size: 25px;
          }
        }

        
.feedback-settings-page .feedback-description {
  font-size: 20px;
  line-height: 2;
}

.feedback-settings-page .feedback-label {
  font-size: 20px;
  font-weight: 600;
}

.feedback-settings-page .feedback-input {
  font-size: 19px;
}

.feedback-settings-page .feedback-input::placeholder {
  font-size: 18px;
}

.feedback-settings-page .feedback-rating-text {
  font-size: 18px;
}

.feedback-settings-page .feedback-message {
  font-size: 18px;
}

      `}</style>

      <div className="feedback-content">
          <h2 className="feedback-title">
            {t("Feedback", "الملاحظات والتقييم")}
          </h2>

          <Card className="feedback-card">
            <CardBody>
              <p className="feedback-description">
                {t(
                  "We value your feedback! Share your experience with MediMind and help us improve our services.",
                  "رأيك يهمنا! شاركنا تجربتك مع MediMind وساعدنا على تحسين خدماتنا."
                )}
              </p>

              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="feedback-name"
                  className="feedback-label"
                >
                  {t("Your Name", "اسمك")}
                </label>

                <input
                  id="feedback-name"
                  type="text"
                  className="form-control feedback-input mb-3"
                  value={name}
                  readOnly
                  autoComplete="name"
                  title={t("Account name (read only)", "اسم الحساب (للعرض فقط)")}
                  placeholder={t(
                    "Enter your name",
                    "أدخل اسمك"
                  )}
                  required
                />

                <label
                  htmlFor="feedback-email"
                  className="feedback-label"
                >
                  {t("Your Email", "بريدك الإلكتروني")}
                </label>

                <input
                  id="feedback-email"
                  type="email"
                  className="form-control feedback-input mb-3"
                  value={email}
                  readOnly
                  autoComplete="email"
                  title={t("Account email (read only)", "البريد الإلكتروني للحساب (للعرض فقط)")}
                  placeholder={t(
                    "Enter your email",
                    "أدخل بريدك الإلكتروني"
                  )}
                  required
                />

                <label
                  htmlFor="feedback-text"
                  className="feedback-label"
                >
                  {t("Your Feedback", "ملاحظاتك")}
                </label>

                <textarea
                  id="feedback-text"
                  className="form-control feedback-input mb-4"
                  rows="5"
                  style={{ minHeight: "130px" }}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t(
                    "Tell us about your experience...",
                    "أخبرنا عن تجربتك..."
                  )}
                  required
                />

                <label className="feedback-label">
                  {t(
                    "Rate Your Experience",
                    "قيّم تجربتك"
                  )}
                </label>

                <div
                  className="mb-4"
                  style={{ direction: "ltr", textAlign: isArabic ? "right" : "left" }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      flexDirection: "row",
                      gap: "5px",
                    }}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="feedback-star"
                        onClick={() => {
                          setRating(star);
                          setMessage("");
                        }}
                        onMouseEnter={() =>
                          setHoverRating(star)
                        }
                        aria-label={t(
                          `Rate ${star} out of 5`,
                          `تقييم ${star} من 5`
                        )}
                        aria-pressed={rating === star}
                        style={{
                          color:
                            star <= (hoverRating || rating)
                              ? "#f5b301"
                              : "#9ca3af",
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <div className="feedback-rating-text">
                    {rating === 0
                      ? t(
                          "Select a rating",
                          "اختر تقييمًا"
                        )
                      : t(
                          `${rating} out of 5 stars`,
                          `${rating} من 5 نجوم`
                        )}
                  </div>
                </div>

                {message && (
                  <div
                    className="feedback-message"
                    role="status"
                  >
                    {message}
                  </div>
                )}

                <Button
                  color="primary"
                  type="submit"
                  className="w-100"
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    padding: "12px",
                    borderRadius: "10px",
                  }}
                >
                  {t(
                    "Send Feedback",
                    "إرسال الملاحظات"
                  )}
                </Button>
              </form>
            </CardBody>
          </Card>
      </div>
    </div>
  );
};

export default FeedbackSettings;
