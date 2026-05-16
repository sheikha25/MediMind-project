import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import ResetPassword from "../components/ResetPassword";

vi.mock("axios");

vi.mock("../assets/medimindlogo.jpg", () => ({
  default: "medimindlogo.jpg",
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ResetPassword Component", () => {
  it("renders reset password page", () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /reset password/i })
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Enter OTP")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter new password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm new password")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("shows error when passwords do not match", () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
      target: { value: "123456" },
    });

    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "654321" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  });

  it("sends reset password request successfully", async () => {
    axios.post.mockResolvedValue({
      data: {
        message: "Password reset successfully",
      },
    });

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter OTP"), {
      target: { value: "1234" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
      target: { value: "123456" },
    });

    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3002/reset-password",
        {
          email: "",
          otp: "1234",
          newPassword: "123456",
        }
      );
    });
  });
});