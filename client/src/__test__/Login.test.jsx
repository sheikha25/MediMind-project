import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "../components/Login";

vi.mock("../assets/medimindlogo.jpg", () => ({
  default: "medimindlogo.jpg",
}));

vi.mock("../components/footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("../features/UserSlice", () => ({
  login: vi.fn((data) => ({
    type: "user/login",
    payload: data,
  })),
}));

const mockDispatch = vi.fn();

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      user: {
        message: "",
        isSuccess: false,
        user: null,
      },
    }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Login Component", () => {
  it("renders login form", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByAltText("MediMind logo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("allows typing email and password", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Email Address"), {
      target: { value: "test@gmail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter Password"), {
      target: { value: "123456" },
    });

    expect(screen.getByPlaceholderText("Enter Email Address")).toHaveValue("test@gmail.com");
    expect(screen.getByPlaceholderText("Enter Password")).toHaveValue("123456");
  });

  it("submits login form", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Email Address"), {
      target: { value: "test@gmail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter Password"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});