import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Forgotpass from "../components/Forgotpass";

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

describe("Forgotpass Component", () => {
  it("renders forgot password page", () => {
    render(
      <MemoryRouter>
        <Forgotpass />
      </MemoryRouter>
    );

    expect(screen.getByText("Forgot Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send otp/i })).toBeInTheDocument();
  });

  it("sends OTP and navigates to reset password page", async () => {
    axios.post.mockResolvedValue({
      data: {
        message: "OTP sent to your email",
      },
    });

    render(
      <MemoryRouter>
        <Forgotpass />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@gmail.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3002/forgot-password",
        { email: "test@gmail.com" }
      );

      expect(mockNavigate).toHaveBeenCalledWith("/reset-password", {
        state: { email: "test@gmail.com" },
      });
    });
  });
});